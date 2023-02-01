import { ClientAPI } from 'contentful-management'

/**
 * Checks if a specified app is installed in an environment
 */
export async function isAppInstalled(
  client: ClientAPI,
  {
    spaceId,
    environmentId,
    appId
  }: {
    spaceId: string
    environmentId: string
    appId: string
  }
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

export async function installApp(
  client: ClientAPI,
  {
    spaceId,
    environmentId,
    appId
  }: {
    spaceId: string
    environmentId: string
    appId: string
  }
): Promise<void> {
  await client.rawRequest({
    method: 'PUT',
    url: `/spaces/${spaceId}/environments/${environmentId}/app_installations/${appId}`
  })
}
