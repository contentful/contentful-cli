import { createClient } from 'contentful-management'

import { getContext } from '../../context'
import { success } from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'
import { successEmoji } from '../../utils/emojis'
import { highlightStyle } from '../../utils/styles'
import { checkLoggedIn } from '../../utils/validators'

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
    .option('organization', {
      alias: 'org',
      describe: 'Organization owning the new space'
    })
}

export async function spaceCreate (argv) {
  await checkLoggedIn()

  const context = await getContext()

  const client = createClient({
    accessToken: context.cmaToken
  })

  let organizationId = null
  if (context.activeOrganizationId) {
    organizationId = context.activeOrganizationId
  }
  if (argv.organization) {
    organizationId = argv.organization
  }

  const space = await client.createSpace({
    name: argv.name
  }, organizationId)

  success(`${successEmoji} Successfully created space ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)})`)
  return space
}

export const handler = handle(spaceCreate)
