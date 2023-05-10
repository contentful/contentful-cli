import chalk from 'chalk'
import { type PlainClientAPI } from 'contentful-management'
import Listr from 'listr'
import path from 'path'
import type { Argv } from 'yargs'
import {
  callCreateChangesetWithResponse,
  getExportMigration
} from '../../utils/app-actions'
import { getAppActionId, type Host } from '../../utils/app-actions-config'
import { handleAsyncError as handle } from '../../utils/async'
import { ensureDir, getPath, writeFileP } from '../../utils/fs'
import { success, error } from '../../utils/log'
import { mergeErrors } from '../../utils/merge/errors'
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

type Context = {
  api: PlainClientAPI
  appDefinitionId: string
  createChangesetActionId: string
  exportActionId: string
  sourceEnvironmentId: string
  targetEnvironmentId: string
  spaceId: string
  changesetRef?: string
  migration?: string
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
}): Promise<Context> => {
  return new Listr([
    {
      title: 'Compute differences',
      // use wrapTask
      task: async (ctx: Context, task) => {
        task.output = chalk`calculating differences`
        const actionResponse = await callCreateChangesetWithResponse({
          api: ctx.api,
          appDefinitionId: ctx.appDefinitionId,
          appActionId: ctx.createChangesetActionId,
          parameters: {
            sourceEnvironmentId: ctx.sourceEnvironmentId,
            targetEnvironmentId: ctx.targetEnvironmentId
          },
          spaceId: ctx.spaceId,
          // We use the target environment as this environment needs to have the merge app installed
          // and the context environment might not have it installed and not need it. Using directly
          // the target env saves us installations. We could have used the source environment also.
          environmentId: ctx.targetEnvironmentId
        }).catch(() => {
          throw new Error(mergeErrors['ErrorInDiffCreation'])
        })

        task.output = chalk`fetching differences`
        // eslint-disable-next-line require-atomic-updates
        ctx.changesetRef = actionResponse.sys.id
      }
    },
    {
      title: chalk`Create migration`,
      task: async ctx => {
        const { migration } = await getExportMigration({
          api: ctx.api,
          appDefinitionId: ctx.appDefinitionId,
          appActionId: ctx.exportActionId,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          changesetRef: ctx.changesetRef!,
          spaceId: ctx.spaceId,
          targetEnvironmentId: ctx.targetEnvironmentId
        }).catch(e => {
          if ((e as Error)?.message === 'PollTimeout') {
            throw new Error(mergeErrors['ExportPollTimeout'])
          }
          throw new Error(mergeErrors['MigrationCouldNotBeExported'])
        })

        // eslint-disable-next-line require-atomic-updates
        ctx.migration = migration
      }
    }
  ]).run({
    api,
    appDefinitionId: appDefinitionId,
    createChangesetActionId,
    exportActionId,
    sourceEnvironmentId,
    targetEnvironmentId,
    spaceId: spaceId
  })
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
    throw new Error(
      'Something failed with the output file. Ensure the path exists and is writable.'
    )
  }

  const result = await callExportAppAction({
    api: client,
    appDefinitionId: mergeAppId,
    createChangesetActionId: getAppActionId('create-changeset', host as Host),
    exportActionId: getAppActionId('export-changeset', host as Host),
    sourceEnvironmentId,
    targetEnvironmentId,
    spaceId: activeSpaceId
  })

  if (result.migration) {
    await writeFileP(outputTarget, result.migration)
    success(`✅ Migration exported to ${outputTarget}.`)
  } else {
    error(`failed to save migration file!`)
  }
}

module.exports.handler = handle(exportEnvironmentMigration)
