import { prompt, PromptModule } from 'inquirer'

import { spaceCreate } from '../../../../lib/cmds/space_cmds/create'
import { spaceUse } from '../../../../lib/cmds/space_cmds/use'
import { getContext } from '../../../../lib/context'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'
import { confirmation } from '../../../../lib/utils/actions'
import { AbortedError } from '../../../../lib/utils/aborted-error'

jest.mock('inquirer')
jest.mock('../../../../lib/cmds/space_cmds/use')
jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/actions')

const mocks = {
  inquirerPrompt: prompt as jest.MockedFunction<PromptModule>,
  getContext: getContext as jest.MockedFunction<any>,
  confirmation: confirmation as jest.MockedFunction<any>,
  createManagementClient: createManagementClient as jest.MockedFunction<any>
}

mocks.confirmation.mockResolvedValue(true)

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

mocks.inquirerPrompt.mockResolvedValue({ organizationId: 'mockedOrgTwo' })
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
mocks.createManagementClient.mockResolvedValue(fakeClient)

mocks.getContext.mockResolvedValue({
  managementToken: 'mockedToken'
})

afterEach(() => {
  fakeClient.createSpace.mockClear()
  mocks.createManagementClient.mockClear()
  getOrganizationsStub.mockClear()
  mocks.inquirerPrompt.mockClear()
  mocks.confirmation.mockClear()
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
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe('')
  expect(mocks.inquirerPrompt).not.toHaveBeenCalled()
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
  expect(mocks.inquirerPrompt).toHaveBeenCalled()
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
  expect(mocks.inquirerPrompt).not.toHaveBeenCalled()
  expect(spaceUse).not.toHaveBeenCalled()
})

test('create space - throws error when sth goes wrong', async () => {
  const errorMessage = 'Unable to create space because of reasons'
  createSpaceStub.mockRejectedValueOnce(new Error(errorMessage))
  await expect(
    spaceCreate({ context: { managementToken: 'management-token' } })
  ).rejects.toThrowError(errorMessage)
  expect(fakeClient.createSpace).toHaveBeenCalledTimes(1)
  expect(mocks.inquirerPrompt).not.toHaveBeenCalled()
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
  expect(fakeClient.createSpace.mock.calls[0][1]).toBe('')
  expect(spaceUse).toHaveBeenCalledWith({
    spaceId: 'MockedSpaceId',
    context: defaults.context,
    header: undefined
  })
})
