import { ClientAPI } from 'contentful-management'
import { checkAndInstallAppInEnvironments } from '../../../../lib/cmds/merge_cmds/export'
import * as appInstallUtils from '../../../../lib/utils/app-installation'

const mockedClient = {
  rawRequest: jest.fn()
} as unknown as ClientAPI

describe('merge export command', () => {
  const isAppInstalled = jest.spyOn(appInstallUtils, 'isAppInstalled')
  const installApp = jest.spyOn(appInstallUtils, 'installApp')

  beforeEach(() => {
    isAppInstalled.mockClear()
    installApp.mockClear()
  })

  it('stops early if both env have the app installed', async () => {
    isAppInstalled.mockResolvedValue(true)

    const ret = await checkAndInstallAppInEnvironments(
      mockedClient,
      'space',
      ['source', 'target'],
      'app-id',
      false
    )

    expect(ret).toBe(true)
    expect(isAppInstalled).toHaveBeenCalledTimes(2)
  })

  it('installs app to both apps if none of them have it installed', async () => {
    isAppInstalled.mockResolvedValue(false)

    const installApp = jest.spyOn(appInstallUtils, 'installApp')

    const ret = await checkAndInstallAppInEnvironments(
      mockedClient,
      'space',
      ['source', 'target'],
      'app-id',
      true
    )

    expect(ret).toBe(true)
    expect(isAppInstalled).toHaveBeenCalledTimes(2)
    expect(installApp).toHaveBeenCalledTimes(1)
  })

  it('installs the app in the other env if only one has it installed', async () => {
    isAppInstalled.mockResolvedValueOnce(false).mockResolvedValueOnce(true)

    const ret = await checkAndInstallAppInEnvironments(
      mockedClient,
      'space',
      ['source', 'target'],
      'app-id',
      true
    )

    expect(ret).toBe(true)
    expect(isAppInstalled).toHaveBeenCalledTimes(2)
  })
})
