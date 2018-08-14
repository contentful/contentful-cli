import { environmentDelete } from '../../../../../lib/cmds/space_cmds/environment_cmds/delete'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { createManagementClient } from '../../../../../lib/utils/contentful-clients'

jest.mock('../../../../../lib/utils/contentful-clients')

const deleteEnvironmentStub = jest.fn()
const environmentData = {
  name: 'environment name',
  sys: {
    id: 'environmentId'
  },
  delete: deleteEnvironmentStub
}
const getEnvironmentStub = jest.fn().mockResolvedValue(environmentData)

const fakeClient = {
  getSpace: async () => ({
    getEnvironment: getEnvironmentStub
  })
}
createManagementClient.mockResolvedValue(fakeClient)

afterEach(() => {
  createManagementClient.mockClear()
  createManagementClient.mockClear()
  getEnvironmentStub.mockClear()
  deleteEnvironmentStub.mockClear()
})
test('delete environment - requires space id', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await expect(environmentDelete({})).rejects.toThrowErrorMatchingSnapshot()
  expect(createManagementClient).not.toHaveBeenCalled()
  expect(getEnvironmentStub).not.toHaveBeenCalled()
  expect(deleteEnvironmentStub).not.toHaveBeenCalled()
})

test('delete environment', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await environmentDelete({
    spaceId: 'someSpaceID',
    environmentId: 'someEnvironmentID'
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getEnvironmentStub).toHaveBeenCalledTimes(1)
  expect(getEnvironmentStub.mock.calls[0][0]).toBe('someEnvironmentID')
  expect(deleteEnvironmentStub).toHaveBeenCalledTimes(1)
})
