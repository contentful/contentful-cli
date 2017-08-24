import { omitBy, isUndefined } from 'lodash'

import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import { getFieldType } from './utils/convert-field-type'
import { logExtension } from './utils/log-as-table'
import mergeDescriptor from './utils/merge-descriptor'
import { assertRequiredValuesProvided } from './utils/assertions'

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
    // We set the default to undefined as the  descriptor file value will be
    // used instead of arg value unless explicitly passed in
    default: undefined,
    describe: 'Render the extension in the sidebar'
  })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
}

async function extensionCreate (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const merged = await mergeDescriptor(argv)

  await assertRequiredValuesProvided(merged)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)

  const extensionData = {
    extension: omitBy({
      name: merged.name,
      src: merged.src,
      srcdoc: merged.srcdoc,
      fieldTypes: merged.fieldTypes.map(getFieldType)
    }, isUndefined)
  }

  const createPromise = merged.id
    ? space.createUiExtensionWithId(merged.id, extensionData)
    : space.createUiExtension(extensionData)

  const extension = await createPromise

  logExtension(extension)
}

export const handler = handle(extensionCreate)
