const Table = require('cli-table3')

const { createManagementClient } = require('../../utils/contentful-clients')
const { log } = require('../../utils/log')
const { handleAsyncError: handle } = require('../../utils/async')
const { getId } = require('../../utils/helpers')
const { getHeadersFromOption } = require('../../utils/headers')

module.exports.command = 'get'

module.exports.desc = 'Show a content type'

module.exports.builder = yargs => {
  return yargs
    .option('id', { type: 'string', demand: true, describe: 'Content Type id' })
    .option('space-id', { alias: 's', type: 'string', describe: 'Space id' })
    .option('management-token', {
      alias: 'mt',
      type: 'string',
      describe: 'Contentful management API token'
    })
    .option('environment-id', {
      alias: 'e',
      type: 'string',
      describe: 'Environment id'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

async function ctShow(argv) {
  const contentTypeId = getId(argv)
  const { managementToken, activeSpaceId, activeEnvironmentId } = argv.context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'content_type-get',
    headers: getHeadersFromOption(argv.header)
  })

  const space = await client.getSpace(activeSpaceId)
  const environment = await space.getEnvironment(activeEnvironmentId)
  const result = await environment.getContentType(contentTypeId)

  const { sys, name, displayField, fields } = result

  const table = new Table({
    head: ['CT Property', 'CT Value']
  })

  table.push(['ID', sys.id])
  table.push(['Name', name])
  table.push(['Display Field', displayField])

  log(table.toString())

  const fieldsTable = new Table({
    head: ['*', 'Field ID', 'Field Name', 'Field Type', 'Required']
  })

  fields.forEach(({ id, name, type, required }) => {
    const isDisplayField = id === displayField
    const displayFieldIndicator = isDisplayField ? '*' : ''
    fieldsTable.push([displayFieldIndicator, id, name, type, required])
  })

  log(fieldsTable.toString())
}

module.exports.handler = handle(ctShow)
