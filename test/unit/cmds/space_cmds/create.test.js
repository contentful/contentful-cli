const inquirer = require('inquirer')

const { spaceCreate } = require('../../../../lib/cmds/space_cmds/create')
const { spaceUse } = require('../../../../lib/cmds/space_cmds/use')
const { getContext } = require('../../../../lib/context')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients')
const { confirmation } = require('../../../../lib/utils/actions')
const { AbortedError } = require('../../../../lib/guide/helpers')

jest.mock('inquirer')
jest.mock('../../../../lib/cmds/space_cmds/use')
jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/actions')

confirmation.mockResolvedValue(true)

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

const defaults = {
  context: {
    managementToken: 'management-token',
    activeSpaceId: 'space',
    activeEnvironmentId: 'master'
  }
}

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
  managementToken: 'mockedToken'
})

afterEach(() => {
  fakeClient.createSpace.mockClear()
  createManagementClient.mockClear()
  getOrganizationsStub.mockClear()
  inquirer.prompt.mockClear()
  confirmation.mockClear()
})

test('create space with single org user', async () => {
  const spaceData = {
    name: 'space name'
  }
  const result = await spaceCreate({ ...defaults, ...spaceData })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace.mock.calls[0][0]).toEqual(spaceData)
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe(undefined)
  expect(inquirer.prompt).not.toHaveBeenCalled()
  expect(spaceUse).not.toHaveBeenCalled()
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
  const result = await spaceCreate({ ...defaults, ...spaceData })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace.mock.calls[0][0]).toEqual(spaceData)
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe('mockedOrgTwo')
  expect(inquirer.prompt).toHaveBeenCalled()
  expect(spaceUse).not.toHaveBeenCalled()
})

test('create space with passed organization id', async () => {
  const spaceData = {
    name: 'space name',
    organizationId: 'mockedOrganizationId'
  }
  const result = await spaceCreate({ ...defaults, ...spaceData })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace.mock.calls[0][0]).toEqual({
    name: spaceData.name
  })
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe('mockedOrganizationId')
  expect(inquirer.prompt).not.toHaveBeenCalled()
  expect(spaceUse).not.toHaveBeenCalled()
})

test('create space - throws error when sth goes wrong', async () => {
  const errorMessage = 'Unable to create space because of reasons'
  createSpaceStub.mockRejectedValueOnce(new Error(errorMessage))
  await expect(
    spaceCreate({ context: { managementToken: 'management-token' } })
  ).rejects.toThrowError(errorMessage)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(inquirer.prompt).not.toHaveBeenCalled()
  expect(spaceUse).not.toHaveBeenCalled()
})

test('create space - accepts default locale', async () => {
  const spaceData = {
    name: 'space name',
    defaultLocale: 'de-DE'
  }
  const result = await spaceCreate({ ...defaults, ...spaceData })
  expect(result).toBeTruthy()
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace.mock.calls[0][0]).toEqual(spaceData)
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe(undefined)
  expect(inquirer.prompt).not.toHaveBeenCalled()
  expect(spaceUse).not.toHaveBeenCalled()
})

test('abort space creation when saying no', async () => {
  const spaceData = {
    name: 'space name'
  }
  createSpaceStub.mockRejectedValueOnce(new AbortedError())
  await expect(
    spaceCreate({ ...defaults, ...spaceData })
  ).rejects.toThrowError()
  expect(spaceUse).not.toHaveBeenCalled()
})

test('create space and use it as default for further commands', async () => {
  const spaceData = {
    name: 'space name'
  }
  const result = await spaceCreate({
    ...defaults,
    ...spaceData,
    use: true
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(fakeClient.createSpace.mock.calls[0][0]).toEqual(spaceData)
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe(undefined)
  expect(spaceUse).toHaveBeenCalledWith({ spaceId: 'MockedSpaceId' })
})
