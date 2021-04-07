const inquirer = require('inquirer')
const { createManagementClient } = require('../../../utils/contentful-clients')

const { setContext, storeRuntimeConfig } = require('../../../context')
const { handleAsyncError: handle } = require('../../../utils/async')
const { success } = require('../../../utils/log')
const paginate = require('../../../utils/pagination')
const { highlightStyle } = require('../../../utils/styles')
const { getHeadersFromOption } = require('../../../utils/headers')

module.exports.command = 'use'

module.exports.desc =
  'Sets the default environment which every command will use when the --environment-id option is skipped.'

module.exports.aliases = ['u']

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful space environment use')
    .option('environment-id', {
      alias: 'e',
      describe:
        'ID of the Environment within the currently active Space to use for other commands',
      type: 'string'
    })
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
    .option('space-id', { alias: 's', type: 'string', describe: 'Space id' })
    .epilog('Copyright 2019 Contentful')
}

function showSuccess(space, environment) {
  success(
    `Now using Environment ${highlightStyle(
      environment.name
    )} (${highlightStyle(environment.sys.id)}) in Space ${highlightStyle(
      space.name
    )} (${highlightStyle(
      space.sys.id
    )}) when the \`--environment-id\` option is missing.`
  )
}

async function environmentUse({ context, environmentId, header }) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-use',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)

  if (environmentId) {
    const environment = await space.getEnvironment(environmentId)

    await setContext({
      activeEnvironmentId: environment.sys.id
    })

    await storeRuntimeConfig()

    showSuccess(space, environment)

    return environment
  }

  const environmentsResult = await paginate({
    client: space,
    method: 'getEnvironments'
  })
  const environmentsChoices = environmentsResult.items
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      environment => ({
        name: `${environment.name} (${environment.sys.id})`,
        value: environment.sys.id
      }),
      {}
    )
    .concat([new inquirer.Separator()])

  const answersEnvironmentSelection = await inquirer.prompt([
    {
      type: 'list',
      name: 'environmentId',
      message: 'Please select an environment:',
      choices: environmentsChoices
    }
  ])

  const environment = await space.getEnvironment(
    answersEnvironmentSelection.environmentId
  )

  await setContext({
    activeEnvironmentId: environment.sys.id
  })

  await storeRuntimeConfig()

  showSuccess(space, environment)

  return environment
}

module.exports.environmentUse = environmentUse

module.exports.handler = handle(environmentUse)
