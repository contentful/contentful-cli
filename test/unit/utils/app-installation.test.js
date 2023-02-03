const {
  isAppInstalled,
  installApp
} = require('../../../lib/utils/app-installation')

const spaceId = 'SPACE_ID'
const environmentId = 'ENV_ID'
const appId = 'APP_ID'

test('uses the right call parameters', async () => {
  const client = {
    rawRequest: jest.fn()
  }
  const isInstalled = await isAppInstalled(client, {
    spaceId,
    environmentId,
    appId
  })

  expect(client.rawRequest).toHaveBeenCalledTimes(1)
  expect(client.rawRequest).toHaveBeenCalledWith({
    method: 'GET',
    url: `/spaces/${spaceId}/environments/${environmentId}/app_installations/${appId}`
  })
})

test('properly handles a truthy check', async () => {
  const client = {
    rawRequest: jest.fn()
  }
  const isInstalled = await isAppInstalled(client, {
    spaceId,
    environmentId,
    appId
  })

  expect(isInstalled).toBeTruthy()
})

test('properly handles a faulty check', async () => {
  const client = {
    rawRequest: jest.fn(async () => {
      throw { name: 'NotFound' }
    })
  }
  const isInstalled = await isAppInstalled(client, {
    spaceId,
    environmentId,
    appId
  })

  expect(isInstalled).toBeFalsy()
})

test('can install an app in an environment', async () => {
  const client = {
    rawRequest: jest.fn()
  }

  await installApp(client, {
    spaceId,
    environmentId,
    appId
  })

  expect(client.rawRequest).toHaveBeenCalledTimes(1)
})

test('can handle arrays when installing apps', async () => {
  const client = {
    rawRequest: jest.fn()
  }

  await installApp(client, {
    spaceId,
    environmentId: [environmentId, environmentId],
    appId
  })

  expect(client.rawRequest).toHaveBeenCalledTimes(2)
})
