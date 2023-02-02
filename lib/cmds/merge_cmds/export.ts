import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { success, warning } from '../../utils/log'
import { confirmation } from '../../utils/actions'
import { installApp, isAppInstalled } from '../../utils/app-installation'
import { createManagementClient } from '../../utils/contentful-clients'
import { type ClientAPI } from 'contentful-management'

const MERGE_APP_ID = 'cQeaauOu1yUCYVhQ00atE'

module.exports.command = 'export'

module.exports.desc = 'Export diff between two environments as a migration'

module.exports.builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful merge export')
    .option('source-environment-id', {
      alias: 's',
      type: 'string',
      demand: true,
      describe: 'Source environment id'
    })
    .option('target-environment-id', {
      alias: 't',
      type: 'string',
      demand: true,
      describe: 'Target environment id'
    })
    .option('yes', {
      alias: 'y',
      describe: 'Confirm merge app installation without prompt'
    })
    .option('output-file', {
      alias: 'o',
      type: 'string',
      describe:
        'Output file. It defaults to ./migrations/<timestamp>-<space-id>-<source-environment-id>-<target-environment-id>.js'
    })
}

interface Context {
  activeSpaceId: string
  managementToken?: string
}

interface ExportMigrationOptions {
  context: Context
  sourceEnvironmentId: string
  targetEnvironmentId: string
  yes?: boolean
  outputFile?: string
}

const promptAppInstallationInEnvironment = async (
  client: ClientAPI,
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

  if (userConfirmation) {
    return false
  }

  await installApp(client, {
    spaceId,
    environmentId: environmentId,
    appId
  })

  return true
}

export const checkAndInstallAppInEnvironments = async (
  client: ClientAPI,
  spaceId: string,
  environmentIds: [string, string],
  appId: string,
  continueWithoutPrompt: boolean
) => {
  const appInstallations = {
    source: await isAppInstalled(client, {
      spaceId: spaceId,
      environmentId: environmentIds[0],
      appId: MERGE_APP_ID
    }),
    target: await isAppInstalled(client, {
      spaceId: spaceId,
      environmentId: environmentIds[1],
      appId: MERGE_APP_ID
    })
  }

  if (appInstallations.source && appInstallations.target) {
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
    if (!appInstallations.source && !appInstallations.target) {
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
      for (const env of environmentIds) {
        const prompt = await promptAppInstallationInEnvironment(
          client,
          spaceId,
          env,
          MERGE_APP_ID
        )

        if (!prompt) {
          return false
        }
      }
    }
  }
  return true
}

const exportEnvironmentMigration = async ({
  context,
  sourceEnvironmentId,
  targetEnvironmentId,
  yes = false
}: ExportMigrationOptions) => {
  const { managementToken, activeSpaceId } = context
  const client = await createManagementClient({
    accessToken: managementToken
  })

  if (sourceEnvironmentId === targetEnvironmentId) {
    throw new Error('Source and target environments cannot be the same.')
  }

  const appInstalled = await checkAndInstallAppInEnvironments(
    client,
    activeSpaceId,
    [sourceEnvironmentId, targetEnvironmentId],
    MERGE_APP_ID,
    yes
  )

  if (!appInstalled) {
    throw new Error('Merge app could not be installed in the environments.')
  }

  success(`Exporting environment migration...`)
}

module.exports.handler = handle(exportEnvironmentMigration)
