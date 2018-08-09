import Table from 'cli-table3'

import { getContext } from '../../../context'
import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { log } from '../../../utils/log'
import paginate from '../../../utils/pagination'

export const command = 'list'

export const desc = 'List your space environments'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space environment list')
    .option('space-id', {
      describe: 'ID of the space the environment will belong to',
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
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken,
    feature: 'space-environment-list'
  })

  const space = await client.getSpace(spaceId)

  const result = await paginate({ client: space, method: 'getEnvironments' })

  const environments = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Environment name', 'Environment id', 'Environment status']
  })

  environments.forEach((environment) => {
    table.push([environment.name, environment.sys.id, environment.sys.status.sys.id])
  })

  log(table.toString())
}

export const handler = handle(environmentList)
