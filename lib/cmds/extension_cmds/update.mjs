import { handleAsyncError as handle } from '../../utils/async.mjs'
import { createManagementClient } from '../../utils/contentful-clients.mjs'
import { successEmoji } from '../../utils/emojis.mjs'
import { getHeadersFromOption } from '../../utils/headers.mjs'
import { success } from '../../utils/log.mjs'
import { createExtension } from './create.mjs'
import {
  assertExtensionValuesProvided,
  assertForceOrCorrectVersionProvided
} from './utils/assertions.mjs'
import { logExtension } from './utils/log-as-table.mjs'
import prepareData from './utils/prepare-data.mjs'
import readSrcDocFile from './utils/read-srcdoc-file.mjs'

export const command = 'update'

export const desc = 'Update an extension'

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

export async function updateExtension(extension, data) {
  extension.extension = data.extension
  extension.parameters = data.parameters

  const updated = await extension.update()

  return updated
}

export async function updateExtensionHandler(argv) {
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

export const handler = handle(updateExtensionHandler)