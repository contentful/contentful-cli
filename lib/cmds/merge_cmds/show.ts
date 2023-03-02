import {
  AppActionCategoryParams,
  callAppAction,
  isResultWithError
} from '@contentful/app-action-utils'
import { Changeset } from '@contentful/changeset-types'
import type { Argv } from 'yargs'
import {
  getAppActionId,
  getAppDefinitionId,
  Host
} from '../../utils/app-actions-config'
import { checkAndInstallAppInEnvironments } from '../../utils/app-installation'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { success } from '../../utils/log'

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

  const { result } = await callAppAction<
    AppActionCategoryParams['CreateChangeset'],
    { changeset: Changeset }
  >({
    api: client,
    appDefinitionId: MERGE_APP_ID,
    appActionId: getAppActionId('create-changeset', host as Host),
    parameters: {
      sourceEnvironmentId,
      targetEnvironmentId
    },
    additionalParameters: {
      spaceId: activeSpaceId,
      environmentId: targetEnvironmentId
    }
  })

  if (isResultWithError(result)) {
    throw result.errorMessage
  }

  const { items } = result.message.changeset

  success('Diff succesfully created: ')
  console.log(JSON.stringify(items, null, 2))
}

module.exports.handler = handle(showEnvironmentChangeset)
