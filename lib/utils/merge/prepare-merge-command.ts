import { getAppDefinitionId, Host } from '../app-actions-config'
import { checkAndInstallAppInEnvironments } from '../app-installation'
import { createPlainClient } from '../contentful-clients'
import { MergeContext } from './types'

type PrepareMergeCommandProps = {
  context: MergeContext
  sourceEnvironmentId: string
  targetEnvironmentId: string

  yes?: boolean
}

export async function prepareMergeCommand({
  context,
  sourceEnvironmentId,
  targetEnvironmentId,
  yes
}: PrepareMergeCommandProps) {
  const { managementToken, activeSpaceId, host } = context
  const mergeAppId = getAppDefinitionId(host)
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
    mergeAppId,
    !!yes
  )

  if (!appInstalled) {
    throw new Error('Merge app could not be installed in the environments.')
  }

  return { activeSpaceId, host, client, mergeAppId }
}
