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
import { Changeset, getContentType, printDiff } from '../../utils/content-types'
import { createPlainClient } from '../../utils/contentful-clients'

module.exports.command = 'show'

module.exports.desc = 'Show diff between two environments'

module.exports.builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful merge show')
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
    getContentType({
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

  return { targetContentType, changeset: changeset as Changeset[] }
}

interface Context {
  activeSpaceId: string
  host: string
  managementToken?: string
}

interface ShowChangesetProps {
  context: Context
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

  const { targetContentType, changeset } =
    await getChangesetAndTargetContentType({
      client,
      activeSpaceId,
      host: host as Host,
      appDefinitionId: MERGE_APP_ID,
      sourceEnvironmentId,
      targetEnvironmentId
    })

  printDiff(targetContentType, changeset)
}

module.exports.handler = handle(showEnvironmentChangeset)
