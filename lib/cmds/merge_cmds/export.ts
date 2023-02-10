import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { success } from '../../utils/log'
import { createPlainClient } from '../../utils/contentful-clients'
import { checkAndInstallAppInEnvironments } from '../../utils/app-installation'

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
      describe: 'Confirm Merge app installation without prompt'
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

const exportEnvironmentMigration = async ({
  context,
  sourceEnvironmentId,
  targetEnvironmentId,
  yes = false
}: ExportMigrationOptions) => {
  const { managementToken, activeSpaceId } = context
  const client = await createPlainClient({
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
