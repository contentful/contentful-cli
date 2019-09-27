const Table = require('cli-table3');

const { handleAsyncError: handle } = require('../../../utils/async');
const { createManagementClient } = require('../../../utils/contentful-clients');
const { log } = require('../../../utils/log');
const paginate = require('../../../utils/pagination');
const { highlightStyle } = require('../../../utils/styles');

export const command = 'list'

export const desc = 'List your space environments'

export const builder = (yargs) => {
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
    .epilog([
      'See more at:',
      'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/list',
      'Copyright 2019 Contentful'
    ].join('\n'))
}

export const aliases = ['ls']

export async function environmentList ({ context }) {
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-list'
  })

  const space = await client.getSpace(activeSpaceId)

  const result = await paginate({ client: space, method: 'getEnvironments' })

  const environments = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Environment name', 'Environment id', 'Environment status']
  })

  environments.forEach((environment) => {
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

export const handler = handle(environmentList)
