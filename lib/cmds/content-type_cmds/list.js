import Table from 'cli-table2'

import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { log } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'

export const command = 'list'

export const desc = 'List your content types'

export const aliases = ['ls']

export const builder = (yargs) => {
  return yargs
    .option('space-id', { type: 'string', describe: 'Space id' })
    .epilog('Copyright 2017 Contentful, this is a BETA release')
}

async function ctList (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)
  const result = await space.getContentTypes()

  const contentTypes = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Content Type Name', 'Content Type ID']
  })

  contentTypes.forEach((contentType) => {
    table.push([contentType.name, contentType.sys.id])
  })

  log(table.toString())
}

export const handler = handle(ctList)
