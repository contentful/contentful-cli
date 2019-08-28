import { environmentAliasUpdate } from '../../../../../lib/cmds/space_cmds/alias_cmds/update'
import { getContext } from '../../../../../lib/context'
import { createManagementClient } from '../../../../../lib/utils/contentful-clients'
import { log } from '../../../../../lib/utils/log'

jest.mock('../../../../../lib/context')
jest.mock('../../../../../lib/utils/contentful-clients')
jest.mock('../../../../../lib/utils/log')

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

const getEnvironmentAliasStub = jest.fn().mockResolvedValue(environmentAliasData)

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

test.only('list environment aliases', async () => {
  await environmentAliasUpdate({
    aliasId: 'alias-id',
    environmentId: 'new-env-id',
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
