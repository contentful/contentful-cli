import { getContext } from '../../context'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { successEmoji } from '../../utils/emojis'
import { success } from '../../utils/log'

import { assertExtensionValuesProvided } from './utils/assertions'
import { logExtension } from './utils/log-as-table'
import prepareData from './utils/prepare-data'
import readSrcDocFile from './utils/read-srcdoc-file'

export const command = 'create'

export const desc = 'Create an extension'

export const builder = (yargs) => {
  return yargs
    .option('id', { type: 'string', describe: 'Extension id' })
    .option('name', { type: 'string', describe: 'Extension name' })
    .option('management-token', { type: 'string', describe: 'Contentful management API token' })
    .option('space-id', { type: 'string', describe: 'Space id' })
    .option('environment-id', { type: 'string', describe: 'Environment id', default: 'master' })
    .option('field-types', { type: 'array', describe: 'Field types' })
    .option('descriptor', { type: 'string', describe: 'Path to an extension descriptor file' })
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
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

export async function createExtension (argv) {
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)

  const data = await prepareData(argv)

  await assertExtensionValuesProvided(data, 'create')

  if (data.extension.srcdoc) {
    await readSrcDocFile(data.extension)
  }

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId
  const environmentId = argv.environmentId

  const client = await createManagementClient({
    accessToken: argv.managementToken || cmaToken,
    feature: 'extension-create'
  })

  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment(environmentId)

  const extensionData = {extension: data.extension}
  if (data.parameters) {
    extensionData.parameters = data.parameters
  }
  const createPromise = data.id
    ? environment.createUiExtensionWithId(data.id, extensionData)
    : environment.createUiExtension(extensionData)

  const extension = await createPromise

  success(`${successEmoji} Successfully created extension:\n`)

  logExtension(extension)
}

export const handler = handle(createExtension)
