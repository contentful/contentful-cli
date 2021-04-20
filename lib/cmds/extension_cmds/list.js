const Table = require('cli-table3')

const { createManagementClient } = require('../../utils/contentful-clients')
const { handleAsyncError: handle } = require('../../utils/async')
const { log } = require('../../utils/log')
const paginate = require('../../utils/pagination')
const { getHeadersFromOption } = require('../../utils/headers')

module.exports.command = 'list'

module.exports.desc = 'List all extensions'

module.exports.builder = yargs => {
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

async function listExtensions({ context, header }) {
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

module.exports.listExtensions = listExtensions

module.exports.handler = handle(listExtensions)
