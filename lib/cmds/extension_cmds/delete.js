const { handleAsyncError: handle } = require('../../utils/async')
const { createManagementClient } = require('../../utils/contentful-clients')
const { successEmoji } = require('../../utils/emojis')
const { getHeadersFromOption } = require('../../utils/headers')
const { success } = require('../../utils/log')

const { assertForceOrCorrectVersionProvided } = require('./utils/assertions')

module.exports.command = 'delete'

module.exports.desc = 'Delete an extension'

module.exports.builder = yargs => {
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

async function deleteExtension(argv) {
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

module.exports.deleteExtension = deleteExtension

module.exports.handler = handle(deleteExtension)
