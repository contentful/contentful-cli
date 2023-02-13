const {
  isAppInstalled,
  installApp
} = require('../../../lib/utils/app-installation')

const spaceId = 'SPACE_ID'
const environmentId = 'ENV_ID'
const appId = 'APP_ID'

const client = {
  appInstallation: {
    get: jest.fn()
  },
  raw: {
    put: jest.fn()
  }
}

describe('app installation utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('uses the right call parameters', async () => {
    await isAppInstalled(client, {
      spaceId,
      environmentId,
      appId
    })

    expect(client.appInstallation.get).toHaveBeenCalledTimes(1)
    expect(client.appInstallation.get).toHaveBeenCalledWith({
      spaceId,
      environmentId,
      appDefinitionId: appId
    })
  })

  test('properly handles a truthy check', async () => {
    const isInstalled = await isAppInstalled(client, {
      spaceId,
      environmentId,
      appId
    })

    expect(isInstalled).toBeTruthy()
  })

  test('properly handles a faulty check', async () => {
    client.appInstallation.get = jest.fn().mockImplementationOnce(async () => {
      throw { name: 'NotFound' }
    })

    const isInstalled = await isAppInstalled(client, {
      spaceId,
      environmentId,
      appId
    })

    expect(isInstalled).toBeFalsy()
  })

  test('can install an app in an environment', async () => {
    await installApp(client, {
      spaceId,
      environmentId,
      appId
    })

    expect(client.raw.put).toHaveBeenCalledTimes(1)
  })

  test('can handle arrays when installing apps', async () => {
    await installApp(client, {
      spaceId,
      environmentId: [environmentId, environmentId],
      appId
    })

    expect(client.raw.put).toHaveBeenCalledTimes(2)
  })
})
