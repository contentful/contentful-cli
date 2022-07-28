const {
  environmentAliasUpdate
} = require('../../../../../lib/cmds/space_cmds/alias_cmds/update.js')
const { getContext } = require('../../../../../lib/context.js')
const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients.js')
const { log } = require('../../../../../lib/utils/log.js')

jest.mock('../../../../../lib/context.js')
jest.mock('../../../../../lib/utils/contentful-clients.js')
jest.mock('../../../../../lib/utils/log.js')

const environmentData = {
  sys: {
    type: 'Environment',
    id: 'envId'
  }
}

const environmentAliasData = {
  sys: {
    id: 'mockedAliasId'
  },
  environment: environmentData
}

environmentAliasData.update = jest.fn().mockResolvedValue(environmentAliasData)

const getEnvironmentAliasStub = jest
  .fn()
  .mockResolvedValue(environmentAliasData)

const fakeClient = {
  getSpace: async () => ({
    getEnvironmentAlias: getEnvironmentAliasStub
  })
}
createManagementClient.mockResolvedValue(fakeClient)

getContext.mockResolvedValue({
  managementToken: 'mockedToken'
})

afterEach(() => {
  createManagementClient.mockClear()
  getEnvironmentAliasStub.mockClear()
  log.mockClear()
})

test('list environment aliases', async () => {
  await environmentAliasUpdate({
    aliasId: 'alias-id',
    targetEnvironmentId: 'new-env-id',
    context: {
      activeSpaceId: 'someSpaceID'
    }
  })
  expect(createManagementClient).toHaveBeenCalledTimes(1)
  expect(getEnvironmentAliasStub).toHaveBeenCalledTimes(1)
  expect(getEnvironmentAliasStub.mock.calls[0][0]).toBe('alias-id')
  expect(environmentAliasData.update).toHaveBeenCalledTimes(1)
  expect(environmentAliasData.environment.sys.id).toBe('new-env-id')
})
