import inquirer from 'inquirer'

import { getContext } from '../../context'
import { success, log } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { successEmoji } from '../../utils/emojis'
import { highlightStyle } from '../../utils/styles'
import { assertLoggedIn } from '../../utils/assertions'

export const command = 'create'

export const desc = 'Create a spaces'

export const builder = (yargs) => {
  return yargs
    .example('contentful space create --name \'Your Space Name\'')
    .option('name', {
      alias: 'n',
      describe: 'Name of the space to create',
      demandOption: true
    })
    .option('organization-id', {
      alias: 'org',
      describe: 'Organization owning the new space'
    })
    .epilog('Copyright 2017 Contentful, this is a BETA release')
}

export async function spaceCreate (argv) {
  await assertLoggedIn()

  let { organizationId } = argv
  const { cmaToken } = await getContext()

  const client = createManagementClient({
    accessToken: cmaToken
  })

  if (!organizationId) {
    const result = await client.getOrganizations()

    if (result.items.length > 1) {
      log()
      log('Your user account is a member of multiple organizations. Please select the organization you would like to add your Space to.')
      log()

      const organizationChoices = result.items
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((organization) => ({
          name: `${organization.name} (${organization.sys.id})`,
          value: organization.sys.id
        }), {})

      const answersOrganizationSelection = await inquirer.prompt([
        {
          type: 'list',
          name: 'organizationId',
          message: 'Please select an organization:',
          choices: organizationChoices
        }
      ])

      organizationId = answersOrganizationSelection.organizationId
    }
  }

  const space = await client.createSpace({
    name: argv.name
  }, organizationId)

  log()
  success(`${successEmoji} Successfully created space ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)})`)
  return space
}

export const handler = handle(spaceCreate)
