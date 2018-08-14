import { environmentList } from '../../../../../lib/cmds/space_cmds/environment_cmds/list'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { createManagementClient } from '../../../../../lib/utils/contentful-clients'
import { log } from '../../../../../lib/utils/log'

jest.mock('../../../../../lib/utils/contentful-clients')
jest.mock('../../../../../lib/utils/log')

const environmentData = {
  name: 'mocked environment name',
  sys: {
    id: 'mockedEnvironmentId',
    status: {
      sys: {
        id: 'ready'
      }
    }
  }
}

const getEnvironmentsStub = jest.fn().mockResolvedValue({
  items: [environmentData]
})

const fakeClient = {
  getSpace: async () => ({
    getEnvironments: getEnvironmentsStub
  })
}
createManagementClient.mockResolvedValue(fakeClient)

afterEach(() => {
  createManagementClient.mockClear()
  getEnvironmentsStub.mockClear()
  log.mockClear()
})

test('list environments - requires space id', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await expect(environmentList({})).rejects.toThrowErrorMatchingSnapshot()
  expect(createManagementClient).not.toHaveBeenCalled()
  expect(getEnvironmentsStub).not.toHaveBeenCalled()
})

test('list environments', async () => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await environmentList({
    spaceId: 'someSpaceID'
  })
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getEnvironmentsStub).toHaveBeenCalledTimes(1)
  expect(log.mock.calls[0][0]).toContain(environmentData.name)
  expect(log.mock.calls[0][0]).toContain(environmentData.sys.id)
  expect(log.mock.calls[0][0]).toContain(environmentData.sys.status.sys.id)
})
