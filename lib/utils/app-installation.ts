import { ClientAPI } from 'contentful-management'

/**
 * Checks if a specified app is installed in an environment
 */
async function appIsInstalled(
  client: ClientAPI,
  spaceId: string,
  environmentId: string,
  appId: string
): Promise<boolean> {
  try {
    await client.rawRequest({
      method: 'GET',
      url: `/spaces/${spaceId}/environments/${environmentId}/app_installations/${appId}`
    })

    return true
  } catch (error: any) {
    // The CMA client will throw if no app definition was found
    if (error?.name === 'NotFound') {
      return false
    } else {
      throw error
    }
  }
}

module.exports.appIsInstalled = appIsInstalled
