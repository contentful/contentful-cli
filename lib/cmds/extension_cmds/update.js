const { handleAsyncError: handle } = require('../../utils/async')
const { createManagementClient } = require('../../utils/contentful-clients')
const { successEmoji } = require('../../utils/emojis')
const { getHeadersFromOption } = require('../../utils/headers')
const { success } = require('../../utils/log')
const { createExtension } = require('./create')

const {
  assertExtensionValuesProvided,
  assertForceOrCorrectVersionProvided
} = require('./utils/assertions')
const { logExtension } = require('./utils/log-as-table')
const prepareData = require('./utils/prepare-data')
const readSrcDocFile = require('./utils/read-srcdoc-file')

module.exports.command = 'update'

module.exports.desc = 'Update an extension'

module.exports.builder = yargs => {
  return yargs
    .option('id', { type: 'string', describe: 'Extension id' })
    .option('name', { type: 'string', describe: 'Extension name' })
    .option('management-token', {
      alias: 'mt',
      type: 'string',
      describe: 'Contentful management API token'
    })
    .option('space-id', { type: 'string', describe: 'Space id' })
    .option('environment-id', { type: 'string', describe: 'Environment id' })
    .option('field-types', { type: 'array', describe: 'Field types' })
    .option('descriptor', {
      type: 'string',
      describe: 'Path to an extension descriptor file'
    })
    .option('src', { type: 'string', describe: 'URL to extension bundle' })
    .option('srcdoc', { type: 'string', describe: 'Path to extension bundle' })
    .option('sidebar', {
      type: 'boolean',
      // We set the default to undefined so the descriptor file value will be
      // used instead of arg value unless explicitly passed in
      default: undefined,
      describe: 'Render the extension in the sidebar'
    })
    .option('version', {
      type: 'number',
      describe: 'Current version of the extension for optimistic locking'
    })
    .option('force', {
      type: 'boolean',
      describe: 'Force operation without explicit version'
    })
    .option('installation-parameters', {
      type: 'string',
      describe: 'JSON string of installation parameter key-value pairs'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

async function updateExtension(extension, data) {
  extension.extension = data.extension
  extension.parameters = data.parameters

  const updated = await extension.update()

  return updated
}

module.exports.updateExtension = updateExtension

async function updateExtensionHandler(argv) {
  const data = await prepareData(argv)

  await assertExtensionValuesProvided(data, 'update')

  if (data.extension.srcdoc) {
    await readSrcDocFile(data.extension)
  }

  const { managementToken, activeSpaceId, activeEnvironmentId } = argv.context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'extension-update',
    headers: getHeadersFromOption(argv.header)
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)

  let extension = null
  let operation = 'update'

  try {
    extension = await environment.getUiExtension(data.id)
  } catch (e) {
    if (argv.force) {
      operation = 'create'
    } else {
      throw e
    }
  }

  if (operation === 'update' && extension) {
    await assertForceOrCorrectVersionProvided(argv, extension.sys.version)

    const updated = await updateExtension(extension, data)

    success(`${successEmoji} Successfully updated extension:\n`)

    logExtension(updated, activeSpaceId, activeEnvironmentId)
  } else if (operation === 'create') {
    const created = await createExtension(environment, data)

    success(`${successEmoji} Successfully created extension:\n`)

    logExtension(created, activeSpaceId, activeEnvironmentId)
  }
}

module.exports.updateExtensionHandler = updateExtensionHandler

module.exports.handler = handle(updateExtensionHandler)
