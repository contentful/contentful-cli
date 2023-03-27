import {
  AppActionCategoryParams,
  callAppAction,
  isResultWithError
} from '@contentful/app-action-utils'
import { PlainClientAPI } from 'contentful-management'
import type { Argv } from 'yargs'
import {
  getAppActionId,
  getAppDefinitionId,
  Host
} from '../../utils/app-actions-config'
import { checkAndInstallAppInEnvironments } from '../../utils/app-installation'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { ContentTypeApiHelper } from '../../utils/merge/content-type-api-helper'
import { prepareMergeCommand } from '../../utils/merge/prepare-merge-command'
import { printChangesetMessages } from '../../utils/merge/print-changeset-messages'
import { ChangesetItem, MergeContext } from '../../utils/merge/types'

module.exports.command = 'show'

module.exports.desc = 'Show diff between two environments'

module.exports.builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful merge show')
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
}

export const getChangesetAndTargetContentType = async ({
  client,
  activeSpaceId,
  host,
  appDefinitionId,
  sourceEnvironmentId,
  targetEnvironmentId
}: {
  client: PlainClientAPI
  activeSpaceId: string
  host: Host
  appDefinitionId: string
  sourceEnvironmentId: string
  targetEnvironmentId: string
}) => {
  const appActionCall = callAppAction<
    AppActionCategoryParams['CreateChangeset'],
    {
      changeset: {
        sys: {
          type: 'Changeset'
        }
        items: Array<unknown>
      }
    }
  >({
    api: client,
    appDefinitionId,
    appActionId: getAppActionId('create-changeset', host),
    parameters: {
      sourceEnvironmentId,
      targetEnvironmentId
    },
    additionalParameters: {
      spaceId: activeSpaceId,
      environmentId: targetEnvironmentId
    }
  })

  const [targetContentType, appActionResult] = await Promise.all([
    ContentTypeApiHelper.getAll({
      client,
      environmentId: targetEnvironmentId,
      spaceId: activeSpaceId
    }),
    appActionCall
  ])

  const { result } = appActionResult

  if (isResultWithError(result)) {
    throw result.errorMessage
  }

  const { items: changeset } = result.message.changeset

  return { targetContentType, changeset: changeset as ChangesetItem[] }
}

interface ShowChangesetProps {
  context: MergeContext
  sourceEnvironmentId: string
  targetEnvironmentId: string
  yes?: boolean
}

const showEnvironmentChangeset = async ({
  context,
  sourceEnvironmentId,
  targetEnvironmentId,
  yes = false
}: ShowChangesetProps) => {
  const { activeSpaceId, host, client, mergeAppId } = await prepareMergeCommand(
    {
      context,
      sourceEnvironmentId,
      targetEnvironmentId,
      yes
    }
  )

  const { targetContentType, changeset } =
    await getChangesetAndTargetContentType({
      client,
      activeSpaceId,
      host: host as Host,
      appDefinitionId: mergeAppId,
      sourceEnvironmentId,
      targetEnvironmentId
    })

  const message = printChangesetMessages(targetContentType, changeset)
  console.log(message)
}

module.exports.handler = handle(showEnvironmentChangeset)
