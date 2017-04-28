import Table from 'cli-table2'
import { createClient } from 'contentful-management'

import { getContext } from '../../context'
import { log } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'

export const command = 'list'

export const desc = 'List your spaces'

export const aliases = ['ls']

async function spaceList (argv) {
  const context = await getContext()

  if (!context.cmaToken) {
    log('Please log in first.')
    return
  }

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
