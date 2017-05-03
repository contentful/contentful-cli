import inquirer from 'inquirer'
import { createClient } from 'contentful-management'

import { getContext, setContext, storeRuntimeConfig } from '../../context'
import { handleAsyncError as handle } from '../../utils/async'
import { log } from '../../utils/log'
import { highlightStyle } from '../../utils/styles'
import { checkLoggedIn } from '../../utils/validators'

export const command = 'use'

export const desc = 'Sets the default space which every command will use when the --space option is skipped.'

export const aliases = ['u']

export async function spaceUse (argv) {
  await checkLoggedIn()

  const context = await getContext()

  const client = createClient({
    accessToken: context.cmaToken
  })

  const spacesResult = await client.getSpaces()
  const spaceChoices = spacesResult.items
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((space) => ({
      name: `${space.name} (${space.sys.id})`,
      value: space.sys.id
    }), {})

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

  log(`Now using Space ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) as default.`)

  return space
}

export const handler = handle(spaceUse)
