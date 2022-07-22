import Table from 'cli-table3'
import { createManagementClient } from '../../utils/contentful-clients.mjs'
import { handleAsyncError as handle } from '../../utils/async.mjs'
import { log } from '../../utils/log.mjs'
import paginate from '../../utils/pagination.mjs'
import { getHeadersFromOption } from '../../utils/headers.mjs'

export const command = 'list'

export const desc = 'List all extensions'

export const builder = yargs => {
  return yargs
    .option('management-token', {
      alias: 'mt',
      type: 'string',
      describe: 'Contentful management API token'
    })
    .option('space-id', { type: 'string', describe: 'Space id' })
    .option('environment-id', { type: 'string', describe: 'Environment id' })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

export async function listExtensions({ context, header }) {
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'extension-list',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)

  const result = await paginate({
    client: environment,
    method: 'getUiExtensions',
    query: {
      order: 'extension.name,sys.id'
    }
  })

  if (result.items.length) {
    const extensions = result.items.sort((a, b) =>
      a.extension.name.localeCompare(b.extension.name)
    )

    const table = new Table({
      head: ['Extension Name', 'Extension ID', 'Version']
    })

    extensions.forEach(extension => {
      table.push([
        extension.extension.name,
        extension.sys.id,
        extension.sys.version
      ])
    })

    log(table.toString())
    return
  }

  log('No extensions found')
}

export const handler = handle(listExtensions)