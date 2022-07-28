const {
  environmentAliasList
} = require('../../../../../lib/cmds/space_cmds/alias_cmds/list.js')
const { getContext } = require('../../../../../lib/context.js')
const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients.js')
const { log } = require('../../../../../lib/utils/log.js')

jest.mock('../../../../../lib/context.js')
jest.mock('../../../../../lib/utils/contentful-clients.js')
jest.mock('../../../../../lib/utils/log.js')

const environmentAliasData = {
  sys: {
    id: 'mockedAliasId'
  },
  environment: {
    sys: {
      type: 'Environment',
      id: 'envId'
    }
  }
}

const getEnvironmentAliasesStub = jest.fn().mockResolvedValue({
  items: [environmentAliasData]
})

const fakeClient = {
  getSpace: async () => ({
    getEnvironmentAliases: getEnvironmentAliasesStub
  })
}
createManagementClient.mockResolvedValue(fakeClient)

getContext.mockResolvedValue({
  managementToken: 'mockedToken'
})

afterEach(() => {
  createManagementClient.mockClear()
  getEnvironmentAliasesStub.mockClear()
  log.mockClear()
})

test('list environment aliases', async () => {
  await environmentAliasList({
    context: {
      activeSpaceId: 'someSpaceID'
    }
  })
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getEnvironmentAliasesStub).toHaveBeenCalledTimes(1)
  expect(log.mock.calls[0][0]).toContain(environmentAliasData.sys.id)
  expect(log.mock.calls[0][0]).toContain(
    environmentAliasData.environment.sys.id
  )
})
