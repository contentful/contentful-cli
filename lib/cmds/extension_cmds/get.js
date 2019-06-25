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
  const {context, id} = argv
  await assertLoggedIn(context)
  await assertSpaceIdProvided(context)

  const { cmaToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: cmaToken,
    feature: 'extension-get'
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)
  const extension = await environment.getUiExtension(id)

  logExtension(extension, activeSpaceId, activeEnvironmentId)
}

export const handler = handle(getExtension)
