import { environmentAliasCreate } from '../../../../../lib/cmds/space_cmds/alias_cmds/create'
import { createPlainClient } from '../../../../../lib/utils/contentful-clients'

jest.mock('../../../../../lib/utils/contentful-clients')

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

const fakeClient = {
  environmentAlias: {
    createWithId: jest.fn().mockResolvedValue(environmentAliasData)
  }
}

const mockCreatePlainClient = (
  createPlainClient as unknown as jest.Mock
).mockResolvedValue(fakeClient)

afterEach(() => {
  jest.clearAllMocks()
})

test('create environment alias', async () => {
  await environmentAliasCreate({
    aliasId: 'alias-id',
    targetEnvironmentId: 'target-env-id',
    context: {
      activeSpaceId: 'someSpaceID',
      managementToken: 'mockedToken'
    }
  })

  expect(mockCreatePlainClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.environmentAlias.createWithId).toHaveBeenCalledTimes(1)
  expect(fakeClient.environmentAlias.createWithId).toHaveBeenCalledWith(
    { spaceId: 'someSpaceID', environmentAliasId: 'alias-id' },
    {
      environment: {
        sys: {
          type: 'Link',
          linkType: 'Environment',
          id: 'target-env-id'
        }
      }
    }
  )
})
