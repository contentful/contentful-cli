const Table = require('cli-table3')

const { handleAsyncError: handle } = require('../../../utils/async')
const { createManagementClient } = require('../../../utils/contentful-clients')
const { getHeadersFromOption } = require('../../../utils/headers')
const { log } = require('../../../utils/log')
const paginate = require('../../../utils/pagination')
const { highlightStyle } = require('../../../utils/styles')

module.exports.command = 'list'

module.exports.desc = 'List your space environments'

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful space environment list')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space the environment will belong to',
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
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/list',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

module.exports.aliases = ['ls']

async function environmentList({ context, header }) {
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-list',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)

  const result = await paginate({ client: space, method: 'getEnvironments' })

  const environments = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Environment name', 'Environment id', 'Environment status']
  })

  environments.forEach(environment => {
    if (activeEnvironmentId === environment.sys.id) {
      table.push([
        highlightStyle(`${environment.name} [active]`),
        highlightStyle(environment.sys.id),
        highlightStyle(environment.sys.status.sys.id)
      ])
    } else {
      table.push([
        environment.name,
        environment.sys.id,
        environment.sys.status.sys.id
      ])
    }
  })

  log(table.toString())
}

module.exports.environmentList = environmentList

module.exports.handler = handle(environmentList)
