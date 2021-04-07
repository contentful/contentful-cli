const { handleAsyncError: handle } = require('../../utils/async')
const { createManagementClient } = require('../../utils/contentful-clients')
const { successEmoji } = require('../../utils/emojis')
const { getHeadersFromOption } = require('../../utils/headers')
const { success } = require('../../utils/log')

const { assertExtensionValuesProvided } = require('./utils/assertions')
const { logExtension } = require('./utils/log-as-table')
const prepareData = require('./utils/prepare-data')
const readSrcDocFile = require('./utils/read-srcdoc-file')

module.exports.command = 'create'

module.exports.desc = 'Create an extension'

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

async function createExtension(environment, data) {
  const extensionData = { extension: data.extension }
  if (data.parameters) {
    extensionData.parameters = data.parameters
  }
  const createPromise = data.id
    ? environment.createUiExtensionWithId(data.id, extensionData)
    : environment.createUiExtension(extensionData)

  const extension = await createPromise

  return extension
}

module.exports.createExtension = createExtension

async function createExtensionHandler(argv) {
  const data = await prepareData(argv)

  await assertExtensionValuesProvided(data, 'create')

  if (data.extension.srcdoc) {
    await readSrcDocFile(data.extension)
  }

  const { managementToken, activeSpaceId, activeEnvironmentId } = argv.context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'extension-create',
    headers: getHeadersFromOption(argv.header)
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)

  const extension = await createExtension(environment, data)

  success(`${successEmoji} Successfully created extension:\n`)

  logExtension(extension, activeSpaceId, activeEnvironmentId)
}

module.exports.createExtensionHandler = createExtensionHandler

module.exports.handler = handle(createExtensionHandler)
