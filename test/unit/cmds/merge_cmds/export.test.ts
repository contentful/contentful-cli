import { PlainClientAPI } from 'contentful-management'

import * as appInstallUtils from '../../../../lib/utils/app-installation'

const mockedClient = {
  appInstallation: {
    get: jest.fn()
  },
  raw: {
    put: jest.fn()
  }
} as unknown as PlainClientAPI

describe('merge export command', () => {
  const isAppInstalled = jest.spyOn(appInstallUtils, 'isAppInstalled')
  const installApp = jest.spyOn(appInstallUtils, 'installApp')

  beforeEach(() => {
    isAppInstalled.mockClear()
    installApp.mockClear()
  })

  it('stops early if both env have the app installed', async () => {
    isAppInstalled.mockResolvedValue(true)

    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        false
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(isAppInstalled).toHaveBeenCalledTimes(2)
  })

  it('installs app to both envs if none of them have it installed', async () => {
    isAppInstalled.mockResolvedValue(false)

    const installApp = jest.spyOn(appInstallUtils, 'installApp')

    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        true
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(isAppInstalled).toHaveBeenCalledTimes(2)
    expect(installApp).toHaveBeenCalledTimes(1)
  })

  it('installs the app in the other env if only one has it installed', async () => {
    isAppInstalled.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        true
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(isAppInstalled).toHaveBeenCalledTimes(2)
  })
})
