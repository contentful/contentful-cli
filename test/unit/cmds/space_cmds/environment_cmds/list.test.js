import { environmentList } from '../../../../../lib/cmds/space_cmds/environment_cmds/list'
import { getContext } from '../../../../../lib/context'
import { createManagementClient } from '../../../../../lib/utils/contentful-clients'
import { log } from '../../../../../lib/utils/log'

jest.mock('../../../../../lib/context')
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

getContext.mockResolvedValue({
  managementToken: 'mockedToken'
})

afterEach(() => {
  createManagementClient.mockClear()
  getEnvironmentsStub.mockClear()
  log.mockClear()
})

test('list environments', async () => {
  await environmentList({
    context: {
      activeSpaceId: 'someSpaceID'
    }
  })
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getEnvironmentsStub).toHaveBeenCalledTimes(1)
  expect(log.mock.calls[0][0]).toContain(environmentData.name)
  expect(log.mock.calls[0][0]).toContain(environmentData.sys.id)
  expect(log.mock.calls[0][0]).toContain(environmentData.sys.status.sys.id)
})
