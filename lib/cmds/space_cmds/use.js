import inquirer from 'inquirer'
import { createManagementClient } from '../../utils/contentful-clients'

import { setContext, storeRuntimeConfig } from '../../context'
import { handleAsyncError as handle } from '../../utils/async'
import { success } from '../../utils/log'
import paginate from '../../utils/pagination'
import { highlightStyle } from '../../utils/styles'

export const command = 'use'

export const desc = 'Sets the default space which every command will use when the --space-id option is skipped.'

export const aliases = ['u']

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space use')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the Space to use for other commands',
      type: 'string'
    })
    .epilog('Copyright 2019 Contentful')
}

function showSuccess (space, env) {
  success(`Now using the '${env}' Environment of Space ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) when the \`--environment-id\` option is missing.`)
}

export async function spaceUse ({ context, spaceId }) {
  const { managementToken, activeEnvironmentId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-use'
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
    .map((space) => ({
      name: `${space.name} (${space.sys.id})`,
      value: space.sys.id
    }), {})
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

export const handler = handle(spaceUse)
