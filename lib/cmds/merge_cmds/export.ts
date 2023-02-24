import { type PlainClientAPI } from 'contentful-management'
import path from 'path'
import type { Argv } from 'yargs'
import {
  callCreateChangeset,
  getExportMigration
} from '../../utils/app-actions'
import {
  getAppActionId,
  getAppDefinitionId,
  type Host
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

export const callExportAppAction = async ({
  api,
  appDefinitionId,
  appActionId,
  sourceEnvironmentId,
  targetEnvironmentId,
  spaceId
}: {
  api: PlainClientAPI
  appDefinitionId: string
  appActionId: string
  sourceEnvironmentId: string
  targetEnvironmentId: string
  spaceId: string
}) => {
  let changesetRef: string

  try {
    changesetRef = await callCreateChangeset({
      api,
      appDefinitionId,
      appActionId,
      parameters: {
        sourceEnvironmentId,
        targetEnvironmentId
      },
      spaceId,
      environmentId: targetEnvironmentId
    })
  } catch (e) {
    throw new Error('Changeset could not be created.')
  }

  const { migration } = await getExportMigration({
    api,
    appDefinitionId,
    appActionId,
    changesetRef,
    spaceId,
    targetEnvironmentId: targetEnvironmentId
  })

  return migration
}

const exportEnvironmentMigration = async ({
  context,
  sourceEnvironmentId,
  targetEnvironmentId,
  yes = false,
  outputFile
}: ExportMigrationOptions) => {
  const { managementToken, activeSpaceId, host } = context
  const MERGE_APP_ID = getAppDefinitionId(host as Host)
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
    throw new Error('Something failed with the output file.')
  }

  let migration: string
  try {
    migration = await callExportAppAction({
      api: client,
      appDefinitionId: MERGE_APP_ID,
      appActionId: getAppActionId('export-changeset', host as Host),
      sourceEnvironmentId,
      targetEnvironmentId,
      spaceId: activeSpaceId
    })
  } catch (e) {
    throw new Error('Migration could not be exported.')
  }

  await writeFileP(outputTarget, migration)

  success(`✅ Migration exported to ${outputTarget}.`)
}

module.exports.handler = handle(exportEnvironmentMigration)
