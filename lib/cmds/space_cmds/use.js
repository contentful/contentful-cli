import inquirer from 'inquirer'
import chalk from 'chalk'
import { createClient } from 'contentful-management'

import { getContext, setContext, storeRuntimeConfig } from '../../context'
import { log } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'

export const command = 'use'

export const desc = 'Sets the default space which every command will use when the --space option is skipped.'

export const aliases = ['u']

export async function spaceUse (argv) {
  const context = await getContext()

  if (!context.cmaToken) {
    log('Please log in first.')
    return false
  }

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

  log(`Now using ${chalk.cyan('space')} with id ${chalk.bold(space.sys.id)} per default.`)

  return space
}

export const handler = handle(spaceUse)
