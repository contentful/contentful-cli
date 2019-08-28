
import Table from 'cli-table3'

import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { log } from '../../../utils/log'
import paginate from '../../../utils/pagination'

export const command = 'list'

export const desc = 'List your space aliases'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space alias list')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space the alias will belong to',
      type: 'string'
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .epilog([
      'Environment aliases is an [ALPHA] Feature',
      'Copyright 2018 Contentful, this is a BETA release'
    ].join('\n'))
}

export const aliases = ['ls']

export async function environmentAliasList ({ context }) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-alias-list'
  })

  const space = await client.getSpace(activeSpaceId)

  const result = await paginate({ client: space, method: 'getEnvironmentAliases' })

  const aliases = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Alias id', 'Aliased to']
  })
  aliases.forEach((alias) => {
    table.push([
      alias.sys.id,
      alias.environment.sys.id
    ])
  })

  log(table.toString())
}

export const handler = handle(environmentAliasList)
