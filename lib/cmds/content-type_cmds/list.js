import Table from 'cli-table3'
import { createManagementClient } from '../../utils/contentful-clients.mjs'
import { handleAsyncError as handle } from '../../utils/async.mjs'
import { log } from '../../utils/log.mjs'
import paginate from '../../utils/pagination.mjs'
import { highlightStyle } from '../../utils/styles.mjs'
import { getHeadersFromOption } from '../../utils/headers.mjs'

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
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

async function ctList({ header, context }) {
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'content_type-list',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)

  log(highlightStyle(`Environment: "${activeEnvironmentId}"`))

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
