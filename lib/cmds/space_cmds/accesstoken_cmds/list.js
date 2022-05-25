const Table = require('cli-table3')

const { handleAsyncError: handle } = require('../../../utils/async')
const { createManagementClient } = require('../../../utils/contentful-clients')
const { getHeadersFromOption } = require('../../../utils/headers')
const { log } = require('../../../utils/log')
const paginate = require('../../../utils/pagination')

module.exports.command = 'list'

module.exports.desc = 'List your delivery access tokens'
const epilog = [
  'See more at:\nhttps://github.com/contentful/contentful-cli/tree/master/docs/space/accesstoken/list',
  'Copyright 2019 Contentful'
].join('\n')

module.exports.builder = yargs => {
  return yargs
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('space-id', { alias: 's', type: 'string', describe: 'Space id' })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .option('silent', {
      describe:
        'Returns the list in raw JSON format instead of a formatted table',
      default: false
    })
    .usage('Usage: contentful space accesstoken list')
    .epilog(epilog)
}

module.exports.aliases = ['ls']

module.exports.accessTokenList = async function accessTokenList({
  context,
  header,
  silent
}) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-access_token-list',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)
  const result = await paginate({ client: space, method: 'getApiKeys' })

  if (silent) {
    delete result.total
    delete result.limit
    delete result.skip
    delete result.sys
    log(JSON.stringify(result, null, 2))
  } else {
    const tokens = result.items.sort((a, b) => a.name.localeCompare(b.name))

    const table = new Table({
      head: ['Name', 'Description', 'Token']
    })

    tokens.forEach(token => {
      table.push([token.name, token.description, token.accessToken])
    })

    log(table.toString())
  }
}

module.exports.handler = handle(module.exports.accessTokenList)
