import { PlainClientAPI } from 'contentful-management'

import * as appInstallUtils from '../../../../lib/utils/app-installation'
import * as exportCmd from '../../../../lib/cmds/merge_cmds/export'

const mockedClient = {
  appInstallation: {
    get: jest.fn()
  },
  raw: {
    put: jest.fn(),
    getDefaultParams: jest.fn()
  },
  environmentAlias: {
    getMany: jest.fn().mockResolvedValue({ items: [] })
  }
} as unknown as PlainClientAPI

describe('merge export command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stops early if both env have the app installed', async () => {
    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        false
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(mockedClient.appInstallation.get).toHaveBeenCalledTimes(2)
  })

  it('installs app to both envs if none of them have it installed', async () => {
    mockedClient.appInstallation.get = jest.fn().mockImplementationOnce(() => {
      throw { name: 'NotFound' }
    })

    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        true
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(mockedClient.appInstallation.get).toHaveBeenCalledTimes(2)
    expect(mockedClient.raw.put).toHaveBeenCalledTimes(2)
  })

  it('installs the app in the other env if only one has it installed', async () => {
    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        true
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(mockedClient.appInstallation.get).toHaveBeenCalledTimes(2)
  })

  it('calls calls the create changeset and export migration actions', async () => {
    mockedClient.appActionCall = {
      create: jest
        .fn()
        .mockResolvedValueOnce({
          sys: {
            id: 'action-id-create-changeset'
          }
        })
        .mockResolvedValueOnce({
          sys: {
            id: 'action-id-export-migration'
          }
        }),
      getCallDetails: jest.fn().mockResolvedValueOnce({
        statusCode: 200,
        response: {
          body: '{"message": {"migration":"console.log(\'hello world\')"}}'
        }
      })
    }

    await exportCmd.callExportAppAction({
      api: mockedClient,
      appDefinitionId: 'app-id',
      exportActionId: 'action-id',
      createChangesetActionId: 'action-id',
      sourceEnvironmentId: 'source',
      targetEnvironmentId: 'target',
      spaceId: 'space'
    })

    expect(mockedClient.appActionCall.create).toHaveBeenCalledTimes(2)
  })
})
