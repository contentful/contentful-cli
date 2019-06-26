import { environmentDelete } from '../../../../../lib/cmds/space_cmds/environment_cmds/delete'
import { getContext } from '../../../../../lib/context'
import { createManagementClient } from '../../../../../lib/utils/contentful-clients'

jest.mock('../../../../../lib/context')
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

getContext.mockResolvedValue({
  cmaToken: 'mockedToken'
})

afterEach(() => {
  createManagementClient.mockClear()
  createManagementClient.mockClear()
  getEnvironmentStub.mockClear()
  deleteEnvironmentStub.mockClear()
})
test('delete environment - requires space id', async () => {
  await expect(environmentDelete({context: {}})).rejects.toThrowErrorMatchingSnapshot()
  expect(createManagementClient).not.toHaveBeenCalled()
  expect(getEnvironmentStub).not.toHaveBeenCalled()
  expect(deleteEnvironmentStub).not.toHaveBeenCalled()
})

test('delete environment', async () => {
  const result = await environmentDelete({
    context: {
      activeSpaceId: 'someSpaceID'
    },
    environmentId: 'someEnvironmentID'
  })
  expect(result).toBeTruthy()
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getEnvironmentStub).toHaveBeenCalledTimes(1)
  expect(getEnvironmentStub.mock.calls[0][0]).toBe('someEnvironmentID')
  expect(deleteEnvironmentStub).toHaveBeenCalledTimes(1)
})
