import Table from 'cli-table2'

import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { log } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'
import { getDisplayName } from './utils/convert-field-type'

export const command = 'get'

export const desc = 'Show an extension'

export const builder = (yargs) => {
  return yargs
  .option('id', { type: 'string', demand: true, describe: 'Extension id' })
  .option('space-id', { type: 'string', describe: 'Space id' })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
}

async function extensionShow (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)
  const extension = await space.getUiExtension(argv.id)

  const table = new Table({
    head: ['Property', 'Value']
  })

  table.push(['ID', extension.sys.id])
  table.push(['Name', extension.extension.name])
  table.push([
    'Field types',
    extension.extension.fieldTypes.map(getDisplayName).join(', ')
  ])
  if (extension.extension.src) {
    table.push(['Src', extension.extension.src])
  }
  table.push(['Version', extension.sys.version])

  log(table.toString())
  log(extension.extension.fieldTypes)
}

export const handler = handle(extensionShow)
