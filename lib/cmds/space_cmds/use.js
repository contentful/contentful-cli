import inquirer from 'inquirer'
import { createManagementClient } from '../../utils/contentful-clients'

import { getContext, setContext, storeRuntimeConfig } from '../../context'
import { handleAsyncError as handle } from '../../utils/async'
import { success } from '../../utils/log'
import { highlightStyle } from '../../utils/styles'
import { assertLoggedIn } from '../../utils/assertions'

export const command = 'use'

export const desc = 'Sets the default space which every command will use when the --space option is skipped.'

export const aliases = ['u']

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space use')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the Space to use for other commands'
    })
    .epilog('Copyright 2017 Contentful, this is a BETA release')
}

function showSuccess (space) {
  success(`Now using Space ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) when the \`--space-id\` option is missing.`)
}

export async function spaceUse (argv) {
  await assertLoggedIn()

  const context = await getContext()
  const { cmaToken } = context
  const spaceId = argv.spaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  if (spaceId) {
    const space = await client.getSpace(spaceId)

    await storeRuntimeConfig()

    showSuccess(space)

    return space
  }

  const spacesResult = await client.getSpaces()
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
    activeSpaceId: space.sys.id
  })

  await storeRuntimeConfig()

  showSuccess(space)

  return space
}

export const handler = handle(spaceUse)
