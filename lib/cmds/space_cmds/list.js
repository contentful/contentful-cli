import Table from 'cli-table2'

import { getContext } from '../../context'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { log } from '../../utils/log'
import normalizer from '../../utils/normalizer'
import { highlightStyle } from '../../utils/styles'
import { assertLoggedIn } from '../../utils/assertions'

export const command = 'list'

export const desc = 'List your spaces'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space list')
    .epilog([
      'See more at:',
      'https://github.com/contentful/contentful-cli/tree/master/docs/space/list',
      'Copyright 2018 Contentful, this is a BETA release'
    ].join('\n'))
}

export const aliases = ['ls']

async function spaceList (argv) {
  await assertLoggedIn()
  const { spaceId } = await normalizer(argv)
  const { cmaToken } = await getContext()

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const result = await client.getSpaces()

  const spaces = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Space name', 'Space id']
  })

  spaces.forEach((space) => {
    if (space.sys.id === spaceId) {
      table.push([highlightStyle(`${space.name} [active]`), highlightStyle(space.sys.id)])
      return
    }
    table.push([space.name, space.sys.id])
  })

  log(table.toString())
}

export const handler = handle(spaceList)
