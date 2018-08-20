import inquirer from 'inquirer'

import { spaceCreate } from '../../../../lib/cmds/space_cmds/create'
import { getContext } from '../../../../lib/context'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'

jest.mock('inquirer')
jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')

const getOrganizationsStub = jest.fn().mockResolvedValue({
  items: [
    {
      name: 'Mocked Org #1',
      sys: {
        id: 'mockedOrgOne'
      }
    }
  ]
})
inquirer.prompt.mockResolvedValue({ organizationId: 'mockedOrgTwo' })
const createSpaceStub = jest.fn().mockResolvedValue({
  name: 'Mocked space name',
  sys: {
    id: 'MockedSpaceId'
  }
})
const fakeClient = {
  createSpace: createSpaceStub,
  getOrganizations: getOrganizationsStub
}
createManagementClient.mockResolvedValue(fakeClient)

getContext.mockResolvedValue({
  cmaToken: 'mockedToken'
})

afterEach(() => {
  fakeClient.createSpace.mockClear()
  createManagementClient.mockClear()
  getOrganizationsStub.mockClear()
  inquirer.prompt.mockClear()
})

test('create space with single org user', async () => {
  const spaceData = {
    name: 'space name'
  }
  const result = await spaceCreate(spaceData)
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace.mock.calls[0][0]).toEqual(spaceData)
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe(undefined)
  expect(inquirer.prompt).not.toHaveBeenCalled()
})

test('create space with multi org user', async () => {
  const spaceData = {
    name: 'space name'
  }
  getOrganizationsStub.mockResolvedValueOnce({
    items: [
      {
        name: 'Mocked Org #1',
        sys: {
          id: 'mockedOrgOne'
        }
      },
      {
        name: 'Mocked Org #2',
        sys: {
          id: 'mockedOrgTwo'
        }
      }
    ]
  })
  const result = await spaceCreate(spaceData)
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace.mock.calls[0][0]).toEqual(spaceData)
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe('mockedOrgTwo')
  expect(inquirer.prompt).toHaveBeenCalled()
})

test('create space with passed organization id', async () => {
  const spaceData = {
    name: 'space name',
    organizationId: 'mockedOrganizationId'
  }
  const result = await spaceCreate(spaceData)
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace.mock.calls[0][0]).toEqual({name: spaceData.name})
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe('mockedOrganizationId')
  expect(inquirer.prompt).not.toHaveBeenCalled()
})

test('create space - fails when not logged in', async () => {
  getContext.mockResolvedValueOnce({
    cmaToken: null
  })
  await expect(spaceCreate({})).rejects.toThrowErrorMatchingSnapshot()
  expect(createManagementClient).not.toHaveBeenCalled()
  expect(inquirer.prompt).not.toHaveBeenCalled()
})

test('create space - throws error when sth goes wrong', async () => {
  const errorMessage = 'Unable to create space because of reasons'
  createSpaceStub.mockRejectedValueOnce(new Error(errorMessage))
  await expect(spaceCreate({})).rejects.toThrowError(errorMessage)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(inquirer.prompt).not.toHaveBeenCalled()
})
