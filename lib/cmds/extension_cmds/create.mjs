import { handleAsyncError as handle } from '../../utils/async.mjs'
import { createManagementClient } from '../../utils/contentful-clients.mjs'
import { successEmoji } from '../../utils/emojis.mjs'
import { getHeadersFromOption } from '../../utils/headers.mjs'
import { success } from '../../utils/log.mjs'
import { assertExtensionValuesProvided } from './utils/assertions.mjs'
import { logExtension } from './utils/log-as-table.mjs'
import prepareData from './utils/prepare-data.mjs'
import readSrcDocFile from './utils/read-srcdoc-file.mjs'

export const command = 'create'

export const desc = 'Create an extension'

export const builder = yargs => {
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

export async function createExtension(environment, data) {
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

export async function createExtensionHandler(argv) {
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

export const handler = handle(createExtensionHandler)