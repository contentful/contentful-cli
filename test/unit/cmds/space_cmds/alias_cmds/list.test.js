const {
  environmentAliasList
} = require('../../../../../lib/cmds/space_cmds/alias_cmds/list.mjs')
const { getContext } = require('../../../../../lib/context.mjs')
const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients.mjs')
const { log } = require('../../../../../lib/utils/log.mjs')

jest.mock('../../../../../lib/context.mjs')
jest.mock('../../../../../lib/utils/contentful-clients.mjs')
jest.mock('../../../../../lib/utils/log.mjs')

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
