import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import { logExtension } from './utils/log-as-table'

export const command = 'get'

export const desc = 'Show an extension'

export const builder = (yargs) => {
  return yargs
    .option('id', { type: 'string', demand: true, describe: 'Extension id' })
    .option('management-token', { alias: 'mt', type: 'string', describe: 'Contentful management API token' })
    .option('space-id', { type: 'string', describe: 'Space id' })
    .option('environment-id', { type: 'string', describe: 'Environment id' })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

async function getExtension (argv) {
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId, activeEnvironmentId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId
  const environmentId = argv.environmentId || activeEnvironmentId || 'master'

  const client = await createManagementClient({
    accessToken: argv.managementToken || cmaToken,
    feature: 'extension-get'
  })

  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment(environmentId)
  const extension = await environment.getUiExtension(argv.id)

  logExtension(extension, spaceId, environmentId)
}

export const handler = handle(getExtension)
