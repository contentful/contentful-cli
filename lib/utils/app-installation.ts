import { PlainClientAPI } from 'contentful-management'
import { confirmation } from './actions'
import { warning } from './log'

/**
 * Checks if a specified app is installed in an environment
 */
export async function isAppInstalled(
  client: PlainClientAPI,
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
    await client.appInstallation.get({
      spaceId,
      environmentId,
      appDefinitionId: appId
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
  client: PlainClientAPI,
  {
    spaceId,
    environmentId,
    appId
  }: {
    spaceId: string
    environmentId: string | string[]
    appId: string
  }
): Promise<void> {
  const environments = Array.isArray(environmentId)
    ? environmentId
    : [environmentId]

  for (const environmentId of environments) {
    await client.raw.put(
      `/spaces/${spaceId}/environments/${environmentId}/app_installations/${appId}`,
      {
        parameters: {}
      }
    )
  }
}

const promptAppInstallationInEnvironment = async (
  client: PlainClientAPI,
  spaceId: string,
  environmentId: string,
  appId: string
) => {
  warning(
    `The Merge app is not installed in the environment with id: ${environmentId}`
  )

  const userConfirmation = await confirmation(
    `Do you want to install the Merge app in the environment with id: ${environmentId}`
  )

  if (!userConfirmation) {
    return false
  }

  await installApp(client, {
    spaceId,
    environmentId,
    appId
  })

  return true
}

export const checkAndInstallAppInEnvironments = async (
  client: PlainClientAPI,
  spaceId: string,
  environmentIds: [string, string],
  appId: string,
  continueWithoutPrompt: boolean
) => {
  const appInstallations = {
    source: {
      id: environmentIds[0],
      installed: await isAppInstalled(client, {
        spaceId: spaceId,
        environmentId: environmentIds[0],
        appId
      })
    },
    target: {
      id: environmentIds[1],
      installed: await isAppInstalled(client, {
        spaceId: spaceId,
        environmentId: environmentIds[1],
        appId
      })
    }
  }

  if (appInstallations.source.installed && appInstallations.target.installed) {
    return true
  }

  // User has passed the --yes flag
  if (continueWithoutPrompt) {
    // Install the app in both environments. If it's already installed it will just continue.
    await installApp(client, {
      spaceId,
      environmentId: environmentIds,
      appId
    })
  } else {
    if (
      !appInstallations.source.installed &&
      !appInstallations.target.installed
    ) {
      warning(
        `The Merge app is not installed in any of the environments. Environment ids: ${environmentIds[0]}, ${environmentIds[1]}`
      )
      const userConfirmation = await confirmation(
        `Do you want to install the Merge app in both environments?`
      )

      if (!userConfirmation) {
        return false
      }

      await installApp(client, {
        spaceId,
        environmentId: environmentIds,
        appId
      })
    } else {
      for (const { installed, id } of Object.values(appInstallations)) {
        if (!installed) {
          const prompt = await promptAppInstallationInEnvironment(
            client,
            spaceId,
            id,
            appId
          )

          if (!prompt) {
            return false
          }
        }
      }
    }
  }
  return true
}
