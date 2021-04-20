const Table = require('cli-table3')

const { handleAsyncError: handle } = require('../../utils/async')
const { createManagementClient } = require('../../utils/contentful-clients')
const { getHeadersFromOption } = require('../../utils/headers')
const { log } = require('../../utils/log')
const paginate = require('../../utils/pagination')
const { highlightStyle } = require('../../utils/styles')

module.exports.command = 'list'

module.exports.desc = 'List your spaces'

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful space list')
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
        'https://github.com/contentful/contentful-cli/tree/master/docs/space/list',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

module.exports.aliases = ['ls']

async function spaceList({ context, header }) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-list',
    headers: getHeadersFromOption(header)
  })

  const result = await paginate({ client, method: 'getSpaces' })

  const spaces = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Space name', 'Space id']
  })

  spaces.forEach(space => {
    if (space.sys.id === activeSpaceId) {
      table.push([
        highlightStyle(`${space.name} [active]`),
        highlightStyle(space.sys.id)
      ])
      return
    }
    table.push([space.name, space.sys.id])
  })

  log(table.toString())
}

module.exports.handler = handle(spaceList)
