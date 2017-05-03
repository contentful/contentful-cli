import Table from 'cli-table2'
import { createClient } from 'contentful-management'

import { getContext } from '../../context'
import { handleAsyncError as handle } from '../../utils/async'
import { log } from '../../utils/log'
import { checkLoggedIn } from '../../utils/validators'

export const command = 'list'

export const desc = 'List your spaces'

export const builder = (yargs) => {
  return yargs
    .example('contentful space list')
    .epilog('See more at:\nhttps://github.com/contentful/contentful-cli/tree/master/docs/space/list')
}

export const aliases = ['ls']

async function spaceList (argv) {
  await checkLoggedIn()

  const context = await getContext()

  const client = createClient({
    accessToken: context.cmaToken
  })

  const result = await client.getSpaces()

  const spaces = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Space name', 'Space id']
  })

  spaces.forEach((space) => {
    table.push([space.name, space.sys.id])
  })

  log(table.toString())
}

export const handler = handle(spaceList)
