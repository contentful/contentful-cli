import Table from 'cli-table3'
import { handleAsyncError as handle } from '../../utils/async.mjs'
import { createManagementClient } from '../../utils/contentful-clients.mjs'
import { getHeadersFromOption } from '../../utils/headers.mjs'
import { log } from '../../utils/log.mjs'
import paginate from '../../utils/pagination.mjs'
import { highlightStyle } from '../../utils/styles.mjs'

export const command = 'list'

export const desc = 'List your spaces'

export const builder = yargs => {
  return yargs
    .usage('Usage: contentful space list')
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/space/list',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

export const aliases = ['ls']

async function spaceList({ context, header }) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-list',
    headers: getHeadersFromOption(header)
  })

  const result = await paginate({ client, method: 'getSpaces' })

  const spaces = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Space name', 'Space id']
  })

  spaces.forEach(space => {
    if (space.sys.id === activeSpaceId) {
      table.push([
        highlightStyle(`${space.name} [active]`),
        highlightStyle(space.sys.id)
      ])
      return
    }
    table.push([space.name, space.sys.id])
  })

  log(table.toString())
}

export const handler = handle(spaceList)
