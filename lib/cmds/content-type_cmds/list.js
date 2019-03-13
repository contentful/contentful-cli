import Table from 'cli-table3'

import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import { log } from '../../utils/log'
import paginate from '../../utils/pagination'
import { highlightStyle } from '../../utils/styles'

export const command = 'list'

export const desc = 'List your content types'

export const aliases = ['ls']

export const builder = yargs => {
  return yargs
    .option('space-id', { alias: 's', type: 'string', describe: 'Space id' })
    .option('management-token', {
      alias: 'mt',
      type: 'string',
      describe: 'Contentful management API token'
    })
    .option('environment-id', {
      alias: 'e',
      type: 'string',
      describe:
        'Environment ID you want to interact with. Defaults to the current active environment.'
    })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

async function ctList (argv) {
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId, activeEnvironmentId } = await getContext()
  const managementToken = argv.managementToken || cmaToken
  const spaceId = argv.spaceId || activeSpaceId
  const environmentId = argv.environmentId || activeEnvironmentId || 'master'

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'content_type-list'
  })

  const space = await client.getSpace(spaceId)
  const environment = await space.getEnvironment(environmentId)
  log(highlightStyle(`Environment: "${environmentId}"`))
  const result = await paginate({
    client: environment,
    method: 'getContentTypes',
    query: {
      order: 'name,sys.id'
    }
  })

  const table = new Table({
    head: ['Content Type Name', 'Content Type ID']
  })

  result.items.forEach(contentType => {
    table.push([contentType.name, contentType.sys.id])
  })

  log(table.toString())
}

export const handler = handle(ctList)
