import { PlainClientAPI } from 'contentful-management'

import * as appInstallUtils from '../../../../lib/utils/app-installation'
import * as showCmd from '../../../../lib/cmds/merge_cmds/show'

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

describe('merge show command', () => {
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
})
