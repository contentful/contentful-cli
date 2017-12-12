import Table from 'cli-table2'

import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { log } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'

export const command = 'list'

export const desc = 'List all extensions'

export const builder = (yargs) => {
  return yargs
  .option('space-id', { type: 'string', describe: 'Space id' })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
}

export async function listExtensions (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)
  const result = await space.getUiExtensions()

  if (result.items.length) {
    const table = new Table({
      head: ['Extension Name', 'Extension ID']
    })

    result.items.forEach((extension) => {
      table.push([extension.extension.name, extension.sys.id])
    })

    log(table.toString())
    return
  }

  log('No extensions found')
}

export const handler = handle(listExtensions)
