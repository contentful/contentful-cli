const inquirer = require('inquirer')
const { createManagementClient } = require('../../utils/contentful-clients')

const { setContext, storeRuntimeConfig } = require('../../context')
const { handleAsyncError: handle } = require('../../utils/async')
const { success } = require('../../utils/log')
const paginate = require('../../utils/pagination')
const { highlightStyle } = require('../../utils/styles')
const { getHeadersFromOption } = require('../../utils/headers')

module.exports.command = 'use'

module.exports.desc =
  'Sets the default space which every command will use when the --space-id option is skipped.'

module.exports.aliases = ['u']

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful space use')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the Space to use for other commands',
      type: 'string'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

function showSuccess(space, env) {
  success(
    `Now using the '${env}' Environment of Space ${highlightStyle(
      space.name
    )} (${highlightStyle(
      space.sys.id
    )}) when the \`--environment-id\` option is missing.`
  )
}

async function spaceUse({ context, spaceId, header }) {
  const { managementToken, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-use',
    headers: getHeadersFromOption(header)
  })

  if (spaceId) {
    const space = await client.getSpace(spaceId)
    await setContext({
      activeSpaceId: space.sys.id,
      activeEnvironmentId
    })

    await storeRuntimeConfig()

    showSuccess(space, activeEnvironmentId)

    return space
  }

  const spacesResult = await paginate({ client, method: 'getSpaces' })
  const spaceChoices = spacesResult.items
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      space => ({
        name: `${space.name} (${space.sys.id})`,
        value: space.sys.id
      }),
      {}
    )
    .concat([new inquirer.Separator()])

  const answersSpaceSelection = await inquirer.prompt([
    {
      type: 'list',
      name: 'spaceId',
      message: 'Please select a space:',
      choices: spaceChoices
    }
  ])

  const space = await client.getSpace(answersSpaceSelection.spaceId)

  await setContext({
    activeSpaceId: space.sys.id,
    activeEnvironmentId
  })

  await storeRuntimeConfig()

  showSuccess(space, activeEnvironmentId)

  return space
}

module.exports.spaceUse = spaceUse

module.exports.handler = handle(spaceUse)
