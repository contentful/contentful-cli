const Table = require('cli-table3')

const { createManagementClient } = require('../../utils/contentful-clients')
const { handleAsyncError: handle } = require('../../utils/async')
const { log } = require('../../utils/log')
const paginate = require('../../utils/pagination')
const { highlightStyle } = require('../../utils/styles')
const { getHeadersFromOption } = require('../../utils/headers')

module.exports.command = 'list'

module.exports.desc = 'List your content types'

module.exports.aliases = ['ls']

module.exports.builder = yargs => {
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

module.exports.handler = handle(ctList)
