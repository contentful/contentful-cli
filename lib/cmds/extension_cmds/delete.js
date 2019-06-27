import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { successEmoji } from '../../utils/emojis'
import { success } from '../../utils/log'

import { assertForceOrCorrectVersionProvided } from './utils/assertions'

export const command = 'delete'

export const desc = 'Delete an extension'

export const builder = (yargs) => {
  return yargs
    .option('id', { type: 'string', demand: true, describe: 'Extension id' })
    .option('management-token', { alias: 'mt', type: 'string', describe: 'Contentful management API token' })
    .option('space-id', { type: 'string', describe: 'Space id' })
    .option('environment-id', { type: 'string', describe: 'Environment id' })
    .option('version', {
      type: 'number',
      describe: 'Current version of the extension for optimistic locking'
    })
    .option('force', {
      type: 'boolean',
      describe: 'Force operation without explicit version'
    })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

export async function deleteExtension (argv) {
  const {context, id} = argv
  await assertLoggedIn(context)
  await assertSpaceIdProvided(context)

  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'extension-delete'
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)
  const extension = await environment.getUiExtension(id)

  await assertForceOrCorrectVersionProvided(argv, extension.sys.version)

  await extension.delete()

  success(`${successEmoji} Successfully deleted extension with ID ${id}`)
}

export const handler = handle(deleteExtension)
