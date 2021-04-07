const Table = require('cli-table3')

const { handleAsyncError: handle } = require('../../utils/async')
const { createManagementClient } = require('../../utils/contentful-clients')
const { getHeadersFromOption } = require('../../utils/headers')
const { log } = require('../../utils/log')
const paginate = require('../../utils/pagination')

module.exports.command = 'list'

module.exports.desc = 'List your organizations'

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful organization list')
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
        'https://github.com/contentful/contentful-cli/tree/master/docs/organization/list',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

module.exports.aliases = ['ls']

async function organizationList({ context, header }) {
  const { managementToken } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'organization-list',
    headers: getHeadersFromOption(header)
  })

  const result = await paginate({ client, method: 'getOrganizations' })

  const organizations = result.items.sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const table = new Table({
    head: ['Organization name', 'Organization id']
  })

  organizations.forEach(({ sys, name }) => {
    table.push([name, sys.id])
  })

  log(table.toString())
}

module.exports.organizationList = organizationList

module.exports.handler = handle(organizationList)
