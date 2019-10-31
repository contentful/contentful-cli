const {
  environmentAliasList
} = require('../../../../../lib/cmds/space_cmds/alias_cmds/list')
const { getContext } = require('../../../../../lib/context')
const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients')
const { log } = require('../../../../../lib/utils/log')

jest.mock('../../../../../lib/context')
jest.mock('../../../../../lib/utils/contentful-clients')
jest.mock('../../../../../lib/utils/log')

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
