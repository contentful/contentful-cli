import { environmentCreate } from '../../../../../lib/cmds/space_cmds/environment_cmds/create'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { createManagementClient } from '../../../../../lib/utils/contentful-clients'

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

afterEach(() => {
  createEnvironmentWithIdStub.mockClear()
  createManagementClient.mockClear()
})
test('create environment - requires space id', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await expect(environmentCreate({})).rejects.toThrowErrorMatchingSnapshot()
  expect(createManagementClient).not.toHaveBeenCalled()
  expect(createEnvironmentWithIdStub).not.toHaveBeenCalled()
})

test('create new environment with id', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
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
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
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
