const Table = require('cli-table3')

const { handleAsyncError: handle } = require('../../../utils/async')
const { createManagementClient } = require('../../../utils/contentful-clients')
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
}

module.exports.aliases = ['ls']

module.exports.environmentAliasList = async function environmentAliasList({
  context
}) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-alias-list'
  })

  const space = await client.getSpace(activeSpaceId)

  const result = await paginate({
    client: space,
    method: 'getEnvironmentAliases'
  })

  const aliases = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Alias id', 'Target environment ID']
  })
  aliases.forEach(alias => {
    table.push([alias.sys.id, alias.environment.sys.id])
  })

  log(table.toString())
}

module.exports.handler = handle(module.exports.environmentAliasList)
