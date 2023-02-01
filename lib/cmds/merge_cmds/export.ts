import type { Argv } from 'yargs'
import { warning } from '../../utils/log'
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
  outputFile?: string
}

const promptInstallAppInEnvironment = async (
  client: ClientAPI,
  spaceId: string,
  environmentId: string,
  appId: string
) => {
  warning(
    `The Merge app is not installed in the environment with id: ${environmentId}`
  )

  if (
    !(await confirmation(
      `The Merge app is not installed in the environment with id: ${environmentId}`
    ))
  ) {
    return false
  }

  await installApp(client, {
    spaceId,
    environmentId: environmentId,
    appId
  })

  return true
}

const promptInstallApp = async (
  client: ClientAPI,
  spaceId: string,
  environmentIds: [string, string],
  appId: string
) => {
  const appInstalledInSource = await isAppInstalled(client, {
    spaceId,
    environmentId: environmentIds[0],
    appId
  })

  const appInstalledInTarget = await isAppInstalled(client, {
    spaceId,
    environmentId: environmentIds[1],
    appId
  })

  if (!appInstalledInSource && !appInstalledInTarget) {
    warning(
      `The Merge app is not installed in any of the environments. Environment ids: ${environmentIds[0]}, ${environmentIds[1]}`
    )

    if (
      !(await confirmation(
        `Do you want to install the merge app in both environments?`
      ))
    ) {
      return false
    }

    await installApp(client, {
      spaceId,
      environmentId: environmentIds[0],
      appId
    })

    await installApp(client, {
      spaceId,
      environmentId: environmentIds[1],
      appId
    })

    return true
  }

  if (!appInstalledInSource) {
    if (
      !(await promptInstallAppInEnvironment(
        client,
        spaceId,
        environmentIds[0],
        appId
      ))
    ) {
      return false
    }
  }

  if (!appInstalledInTarget) {
    if (
      !(await promptInstallAppInEnvironment(
        client,
        spaceId,
        environmentIds[1],
        appId
      ))
    ) {
      return false
    }
  }

  return true
}

const exportEnvironmentMigration = async ({
  context,
  sourceEnvironmentId,
  targetEnvironmentId
}: ExportMigrationOptions) => {
  const { managementToken, activeSpaceId } = context
  const client = await createManagementClient({
    accessToken: managementToken
  })

  await promptInstallApp(
    client,
    activeSpaceId,
    [sourceEnvironmentId, targetEnvironmentId],
    MERGE_APP_ID
  )
}

module.exports.handler = exportEnvironmentMigration
