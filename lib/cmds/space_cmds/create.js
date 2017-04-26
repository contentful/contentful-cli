import chalk from 'chalk'
import { createClient } from 'contentful-management'

import { getContext } from '../../context'
import { log, logError } from '../../utils/log'

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

export const handler = async function spaceCreate (argv) {
  const context = await getContext()

  if (!context.cmaToken) {
    log('Please log in first.')
    return false
  }

  const client = createClient({
    accessToken: context.cmaToken
  })

  try {
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

    log(`${chalk.green('Successfully')} created space ${chalk.cyan(space.name)} with id ${chalk.bold(space.sys.id)}`)
    return space
  } catch (err) {
    logError(err)
    throw err
  }
}
