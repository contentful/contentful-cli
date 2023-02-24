import path from 'path'
import type { Argv } from 'yargs'
import {
  callCreateChangeset,
  getExportMigration
} from '../../utils/app-actions'
import {
  getAppActionId,
  getAppDefinitionId
} from '../../utils/app-actions-config'
import { checkAndInstallAppInEnvironments } from '../../utils/app-installation'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { ensureDir, getPath, writeFileP } from '../../utils/fs'
import { success } from '../../utils/log'

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
  host?: string
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
  yes = false,
  outputFile
}: ExportMigrationOptions) => {
  const { managementToken, activeSpaceId, host } = context
  const MERGE_APP_ID = getAppDefinitionId(host)
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

  let outputTarget: string
  try {
    outputTarget = getPath(
      outputFile ||
        path.join(
          'migrations',
          `${Date.now()}-${activeSpaceId}-${sourceEnvironmentId}-${targetEnvironmentId}.js`
        )
    )
    await ensureDir(path.dirname(outputTarget))
  } catch (e) {
    console.error(e)
    throw new Error('Migration could not be exported.')
  }

  let changesetRef: string

  try {
    changesetRef = await callCreateChangeset({
      api: client,
      appDefinitionId: MERGE_APP_ID,
      appActionId: getAppActionId('create-changeset', host),
      parameters: {
        sourceEnvironmentId,
        targetEnvironmentId
      },
      spaceId: activeSpaceId,
      environmentId: targetEnvironmentId
    })
  } catch (e) {
    throw new Error('Changeset could not be created.')
  }

  const { migration } = await getExportMigration({
    api: client,
    appDefinitionId: MERGE_APP_ID,
    appActionId: getAppActionId('export-changeset', host),
    changesetRef,
    spaceId: activeSpaceId,
    targetEnvironmentId: targetEnvironmentId
  })

  await writeFileP(outputTarget, migration)

  success(`✅ Migration exported to ${outputTarget}.`)
}

module.exports.handler = handle(exportEnvironmentMigration)
