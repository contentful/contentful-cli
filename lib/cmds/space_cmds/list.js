const Table = require('cli-table3')

const { handleAsyncError: handle } = require('../../utils/async')
const { createManagementClient } = require('../../utils/contentful-clients')
const { getHeadersFromOption } = require('../../utils/headers')
const { log } = require('../../utils/log')
const Paginator = require('../../utils/paginator')
const useKeyPress = require('../../utils/useKeypress')
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

  const paginator = new Paginator({
    client,
    method: 'getSpaces',
    totalPerPage: 5
  })

  const table = new Table({
    head: ['Space name', 'Space id'],
    colWidths: [30, 30],
    wordWrap: true
  })

  const renderResult = spaces => {
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

    process.stdout.cursorTo(0, 0)
    process.stdout.clearScreenDown()
    process.stdout.write(table.toString())

    log(`\nShown ${table.length} from ${paginator.totalItems}`)
    if (!paginator.isFulfilled) {
      log(`Press ${highlightStyle('Down')} to see more spaces`)
    } else {
      log(`Press ${highlightStyle('Ctrl+C')} to exit`)
    }
  }

  useKeyPress(key => {
    if (key.name === 'down') {
      if (!paginator.isFulfilled) {
        paginator.next().then(renderResult)
      }
    }
  })

  const spaces = await paginator.next()
  renderResult(spaces)
}

module.exports.handler = handle(spaceList)
