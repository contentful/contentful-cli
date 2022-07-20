import Table from 'cli-table3'
import { handleAsyncError as handle } from '../../../utils/async.mjs'
import { createManagementClient } from '../../../utils/contentful-clients.mjs'
import { getHeadersFromOption } from '../../../utils/headers.mjs'
import { log } from '../../../utils/log.mjs'
import paginate from '../../../utils/pagination.mjs'

export const command = 'list'

export const desc = 'List your space aliases'

export const builder = yargs => {
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
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
}

export const aliases = ['ls']

export const environmentAliasList = async function environmentAliasList({
  context,
  header
}) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-alias-list',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)

  const result = await paginate({
    client: space,
    method: 'getEnvironmentAliases'
  })

  const aliases = result.items.sort((a, b) => a.sys.id.localeCompare(b.sys.id))

  const table = new Table({
    head: ['Alias id', 'Target environment ID']
  })
  aliases.forEach(alias => {
    table.push([alias.sys.id, alias.environment.sys.id])
  })

  log(table.toString())
}

export const handler = handle(environmentAliasList)
