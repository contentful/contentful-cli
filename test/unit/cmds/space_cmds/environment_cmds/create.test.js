import { environmentCreate } from '../../../../../lib/cmds/space_cmds/environment_cmds/create'
import { getContext } from '../../../../../lib/context'
import { createManagementClient } from '../../../../../lib/utils/contentful-clients'

jest.mock('../../../../../lib/context')
jest.mock('../../../../../lib/utils/contentful-clients')

const environmentData = {
  name: 'environment name',
  sys: {
    id: 'environmentId'
  }
}

const createEnvironmentWithIdStub = jest.fn().mockResolvedValue(environmentData)

const fakeClient = {
  getSpace: async () => ({
    createEnvironmentWithId: createEnvironmentWithIdStub
  })
}
createManagementClient.mockResolvedValue(fakeClient)

getContext.mockResolvedValue({
  cmaToken: 'mockedToken'
})

afterEach(() => {
  createEnvironmentWithIdStub.mockClear()
  createManagementClient.mockClear()
})

test('create environment - requires space id', async () => {
  await expect(environmentCreate({})).rejects.toThrowErrorMatchingSnapshot()
  expect(createManagementClient).not.toHaveBeenCalled()
  expect(createEnvironmentWithIdStub).not.toHaveBeenCalled()
})

test('create new environment with id', async () => {
  const result = await environmentCreate({
    spaceId: 'someSpaceID',
    environmentId: 'test'
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub.mock.calls[0][0]).toBe('test')
  expect(createEnvironmentWithIdStub.mock.calls[0][1]).toEqual({})
})

test('create new environment with id and name', async () => {
  const result = await environmentCreate({
    spaceId: 'someSpaceID',
    environmentId: 'test',
    name: 'test'
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub.mock.calls[0][0]).toBe('test')
  expect(createEnvironmentWithIdStub.mock.calls[0][1]).toEqual({ name: 'test' })
})

test.only('create new environment with id and name and source', async () => {
  const result = await environmentCreate({
    spaceId: 'someSpaceID',
    environmentId: 'test',
    name: 'test',
    source: 'srcEnv'
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub).toHaveBeenCalledTimes(1)
  expect(createEnvironmentWithIdStub.mock.calls[0][0]).toBe('test')
  expect(createEnvironmentWithIdStub.mock.calls[0][1]).toEqual({ name: 'test' })
  expect(createEnvironmentWithIdStub.mock.calls[0][2]).toEqual('srcEnv')
})
