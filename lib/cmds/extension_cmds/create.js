import { getContext } from '../../context'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { successEmoji } from '../../utils/emojis'
import { success } from '../../utils/log'

import { logExtension } from './utils/log-as-table'
import prepareData from './utils/prepare-data'
import { assertExtensionValuesProvided } from './utils/assertions'

export const command = 'create'

export const desc = 'Create an extension'

export const builder = (yargs) => {
  return yargs
    .option('id', { type: 'string', describe: 'Extension id' })
    .option('name', { type: 'string', describe: 'Extension name' })
    .option('space-id', { type: 'string', describe: 'Space id' })
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
    .epilog('Copyright 2017 Contentful, this is a BETA release')
}

export async function createExtension (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const data = await prepareData(argv)

  await assertExtensionValuesProvided(data, 'create')

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)

  const extensionData = {
    extension: data.extension
  }

  const createPromise = data.id
    ? space.createUiExtensionWithId(data.id, extensionData)
    : space.createUiExtension(extensionData)

  const extension = await createPromise

  success(`${successEmoji} Successfully created extension:\n`)

  logExtension(extension)
}

export const handler = handle(createExtension)
