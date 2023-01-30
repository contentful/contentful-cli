const { appIsInstalled } = require('../../../lib/utils/app-installation')

const spaceId = 'SPACE_ID'
const envId = 'ENV_ID'
const appId = 'APP_ID'

test('uses the right call parameters', async () => {
  const client = {
    rawRequest: jest.fn()
  }
  const isInstalled = await appIsInstalled(client, spaceId, envId, appId)

  expect(client.rawRequest).toHaveBeenCalledTimes(1)
  expect(client.rawRequest).toHaveBeenCalledWith({
    method: 'GET',
    url: `/spaces/${spaceId}/environments/${envId}/app_installations/${appId}`
  })
})

test('properly handles a truthy check', async () => {
  const client = {
    rawRequest: jest.fn()
  }
  const isInstalled = await appIsInstalled(client, spaceId, envId, appId)

  expect(isInstalled).toBeTruthy()
})

test('properly handles a faulty check', async () => {
  const client = {
    rawRequest: jest.fn(async () => {
      throw { name: 'NotFound' }
    })
  }
  const isInstalled = await appIsInstalled(client, spaceId, envId, appId)

  expect(isInstalled).toBeFalsy()
})
