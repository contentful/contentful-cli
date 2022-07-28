import { handleAsyncError as handle } from '../../utils/async.js'
import { createManagementClient } from '../../utils/contentful-clients.js'
import { successEmoji } from '../../utils/emojis.js'
import { getHeadersFromOption } from '../../utils/headers.js'
import { success } from '../../utils/log.js'
import { assertForceOrCorrectVersionProvided } from './utils/assertions.js'

export const command = 'delete'

export const desc = 'Delete an extension'

export const builder = yargs => {
  return yargs
    .option('id', { type: 'string', demand: true, describe: 'Extension id' })
    .option('management-token', {
      alias: 'mt',
      type: 'string',
      describe: 'Contentful management API token'
    })
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
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

export async function deleteExtension(argv) {
  const { context, id } = argv
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'extension-delete',
    headers: getHeadersFromOption(argv.header)
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)
  const extension = await environment.getUiExtension(id)

  await assertForceOrCorrectVersionProvided(argv, extension.sys.version)

  await extension.delete()

  success(`${successEmoji} Successfully deleted extension with ID ${id}`)
}

export const handler = handle(deleteExtension)
