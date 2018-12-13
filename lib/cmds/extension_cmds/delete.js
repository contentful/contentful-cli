import { getContext } from '../../context'
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
    .option('management-token', { type: 'string', describe: 'Contentful management API token' })
    .option('space-id', { type: 'string', describe: 'Space id' })
    .option('environment-id', { type: 'string', describe: 'Environment id', default: 'master' })
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
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId
  const environmentId = argv.environmentId

  const client = await createManagementClient({
    accessToken: argv.managementToken || cmaToken,
    feature: 'extension-delete'
  })

  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment(environmentId)
  const extension = await environment.getUiExtension(argv.id)

  await assertForceOrCorrectVersionProvided(argv, extension.sys.version)

  await extension.delete()

  success(`${successEmoji} Successfully deleted extension with ID ${argv.id}`)
}

export const handler = handle(deleteExtension)
