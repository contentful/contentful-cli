const { confirmation } = require('../../utils/actions')
const { handleAsyncError: handle } = require('../../utils/async')
const { createManagementClient } = require('../../utils/contentful-clients')
const { successEmoji } = require('../../utils/emojis')
const { getHeadersFromOption } = require('../../utils/headers')
const { log, success } = require('../../utils/log')
const { highlightStyle, warningStyle } = require('../../utils/styles')

module.exports.command = 'delete'
module.exports.desc = 'Deletes a space'

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful space delete')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space to delete',
      nargs: 1,
      demandOption: true
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('yes', {
      describe: 'Skip the confirmation question'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

async function spaceDelete({ context, yes, header }) {
  const { managementToken, activeSpaceId } = context
  const client = await createManagementClient({
    accessToken: managementToken,
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)

  if (!yes) {
    log(
      `You are about to delete your ${highlightStyle(
        space.name
      )} (${highlightStyle(
        space.sys.id
      )}) space and all of its content. This cannot be undone.`
    )
    log()

    const confirm = await confirmation('Do you want to confirm the deletion?')
    log()

    if (!confirm) {
      log(warningStyle(`Space deletion aborted.`))
      return
    }
  }

  log()
  await space.delete()

  log()
  success(
    `${successEmoji} Your ${highlightStyle(space.name)} (${highlightStyle(
      space.sys.id
    )}) space was successfully deleted.`
  )
}

module.exports.spaceDelete = spaceDelete

module.exports.handler = handle(spaceDelete)
