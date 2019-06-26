import Table from 'cli-table3'

import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { log } from '../../../utils/log'
import paginate from '../../../utils/pagination'
import { highlightStyle } from '../../../utils/styles'

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
      'Copyright 2018 Contentful, this is a BETA release'
    ].join('\n'))
}

export const aliases = ['ls']

export async function environmentList (argv) {
  const { context } = argv
  await assertLoggedIn(context)
  await assertSpaceIdProvided(context)

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
