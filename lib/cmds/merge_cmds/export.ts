import { type PlainClientAPI } from 'contentful-management'
import path from 'path'
import type { Argv } from 'yargs'
import {
  callCreateChangeset,
  getExportMigration
} from '../../utils/app-actions'
import { getAppActionId, type Host } from '../../utils/app-actions-config'
import { handleAsyncError as handle } from '../../utils/async'
import { ensureDir, getPath, writeFileP } from '../../utils/fs'
import { success } from '../../utils/log'
import { prepareMergeCommand } from '../../utils/merge/prepare-merge-command'
import { MergeContext } from '../../utils/merge/types'

module.exports.command = 'export'

module.exports.desc = 'Export diff between two environments as a migration'

module.exports.builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful merge export')
    .option('source-environment-id', {
      alias: 'se',
      type: 'string',
      demandOption: true,
      describe: 'Source environment id'
    })
    .option('target-environment-id', {
      alias: 'te',
      type: 'string',
      demandOption: true,
      describe: 'Target environment id'
    })
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space that holds the environment',
      type: 'string'
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

interface ExportMigrationOptions {
  context: MergeContext
  sourceEnvironmentId: string
  targetEnvironmentId: string
  yes?: boolean
  outputFile?: string
}

export const callExportAppAction = async ({
  api,
  appDefinitionId,
  createChangesetActionId,
  exportActionId,
  sourceEnvironmentId,
  targetEnvironmentId,
  spaceId
}: {
  api: PlainClientAPI
  appDefinitionId: string
  createChangesetActionId: string
  exportActionId: string
  sourceEnvironmentId: string
  targetEnvironmentId: string
  spaceId: string
}) => {
  let changesetRef: string

  try {
    changesetRef = await callCreateChangeset({
      api,
      appDefinitionId,
      appActionId: createChangesetActionId,
      parameters: {
        sourceEnvironmentId,
        targetEnvironmentId
      },
      spaceId,
      // We use the target environment as this environment needs to have the merge app installed
      // and the context environment might not have it installed and not need it. Using directly
      // the target env saves us installations. We could have used the source environment also.
      environmentId: targetEnvironmentId
    })
  } catch (e) {
    throw new Error('Changeset could not be created.')
  }

  const { migration } = await getExportMigration({
    api,
    appDefinitionId,
    appActionId: exportActionId,
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
  const { activeSpaceId, host, client, mergeAppId } = await prepareMergeCommand(
    {
      context,
      sourceEnvironmentId,
      targetEnvironmentId,
      yes
    }
  )

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
      appDefinitionId: mergeAppId,
      createChangesetActionId: getAppActionId('create-changeset', host as Host),
      exportActionId: getAppActionId('export-changeset', host as Host),
      sourceEnvironmentId,
      targetEnvironmentId,
      spaceId: activeSpaceId
    })
  } catch (e) {
    if (e instanceof Error) {
      throw e.message
    }

    throw new Error('Migration could not be exported.')
  }

  await writeFileP(outputTarget, migration)

  success(`✅ Migration exported to ${outputTarget}.`)
}

module.exports.handler = handle(exportEnvironmentMigration)
