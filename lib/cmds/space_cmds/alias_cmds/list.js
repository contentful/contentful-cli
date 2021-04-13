const Table = require('cli-table3')

const { handleAsyncError: handle } = require('../../../utils/async')
const { createManagementClient } = require('../../../utils/contentful-clients')
const { getHeadersFromOption } = require('../../../utils/headers')
const { log } = require('../../../utils/log')
const paginate = require('../../../utils/pagination')

module.exports.command = 'list'

module.exports.desc = 'List your space aliases'

module.exports.builder = yargs => {
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

module.exports.aliases = ['ls']

module.exports.environmentAliasList = async function environmentAliasList({
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

module.exports.handler = handle(module.exports.environmentAliasList)
