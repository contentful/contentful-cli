import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import { Argv } from 'yargs'
import { createManagementClient } from '../../utils/contentful-clients'

import { setContext, storeRuntimeConfig } from '../../context'
import { handleAsyncError as handle } from '../../utils/async'
import { success } from '../../utils/log'
import paginate from '../../utils/pagination'
import { highlightStyle } from '../../utils/styles'
import { getHeadersFromOption } from '../../utils/headers'
import { copyright } from '../../utils/copyright'
import { Space } from 'contentful-management'

export const command = 'use'

export const desc =
  'Sets the default space which every command will use when the --space-id option is skipped.'

export const aliases = ['u']

export const builder = (yargs: Argv) => {
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
    .epilog(copyright)
}

function showSuccess(space: Space, env = 'master') {
  success(
    `Now using the '${env}' Environment of Space ${highlightStyle(
      space.name
    )} (${highlightStyle(
      space.sys.id
    )}) when the \`--environment-id\` option is missing.`
  )
}

interface Context {
  managementToken?: string
  activeSpaceId?: string
  activeEnvironmentId?: string
}

interface SpaceUseProps {
  context: Context
  spaceId?: string
  header?: string
  successMsg?: boolean
}

export async function spaceUse({
  context,
  spaceId,
  header,
  successMsg = true
}: SpaceUseProps) {
  inquirer.registerPrompt('autocomplete', inquirerPrompt)
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
    if (successMsg) showSuccess(space, activeEnvironmentId)

    return space
  }

  const spacesResult = await paginate({ client, method: 'getSpaces' })
  const spaceChoices = (spacesResult.items as Array<Space>)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      space => ({
        name: `${space.name} (${space.sys.id})`,
        value: space.sys.id
      }),
      {}
    )

  const answersSpaceSelection = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'spaceId',
      prefix: '👀',
      message: 'Please select a space:',
      source: (_: any, input = '') =>
        spaceChoices.filter(space => space.name.includes(input))
    }
  ])

  const space = await client.getSpace(answersSpaceSelection.spaceId)

  await setContext({
    activeSpaceId: space.sys.id,
    activeEnvironmentId
  })

  await storeRuntimeConfig()

  if (successMsg) showSuccess(space, activeEnvironmentId)

  return space
}

export const handler = handle(spaceUse)
