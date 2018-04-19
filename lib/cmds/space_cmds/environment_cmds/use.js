import inquirer from 'inquirer'
import { createManagementClient } from '../../../utils/contentful-clients'

import { getContext, setContext, storeRuntimeConfig } from '../../../context'
import { assertLoggedIn } from '../../../utils/assertions'
import { handleAsyncError as handle } from '../../../utils/async'
import { success } from '../../../utils/log'
import paginate from '../../../utils/pagination'
import { highlightStyle } from '../../../utils/styles'

export const command = 'use'

export const desc = 'Sets the default environment which every command will use when the --environment-id option is skipped.'

export const aliases = ['u']

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space environment use')
    .option('environment-id', {
      alias: 'e',
      describe: 'ID of the Environment within the currently active Space to use for other commands'
    })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

function showSuccess (space, environment) {
  success(`Now using Environment ${highlightStyle(environment.name)} (${highlightStyle(environment.sys.id)}) in Space ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) when the \`--environment-id\` option is missing.`)
}

export async function environmentUse (argv) {
  await assertLoggedIn()

  const { cmaToken, activeSpaceId } = await getContext()
  const environmentId = argv.environmentId

  const client = await createManagementClient({
    accessToken: cmaToken
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

  const environmentsResult = await paginate({ client: space, method: 'getEnvironments' })
  const environmentsChoices = environmentsResult.items
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((environment) => ({
      name: `${environment.name} (${environment.sys.id})`,
      value: environment.sys.id
    }), {})
    .concat([new inquirer.Separator()])

  const answersEnvironmentSelection = await inquirer.prompt([
    {
      type: 'list',
      name: 'environmentId',
      message: 'Please select an environment:',
      choices: environmentsChoices
    }
  ])

  const environment = await space.getEnvironment(answersEnvironmentSelection.environmentId)

  await setContext({
    activeEnvironmentId: environment.sys.id
  })

  await storeRuntimeConfig()

  showSuccess(space, environment)

  return environment
}

export const handler = handle(environmentUse)
