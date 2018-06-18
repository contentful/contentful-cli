import { getContext } from '../../context'
import * as logging from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn } from '../../utils/assertions'

import { EventSystem } from '../../core/events'
import { CREATE_SPACE_HANDLER } from '../../core/events/scopes'

import IntentSystem from '../../core/event-handlers/intents'
import LoggingSystem from '../../core/event-handlers/logging'

import createSpaceIntents from '../../core/event-handlers/intents/create-space-handler'
import createSpaceLogging from '../../core/event-handlers/logging/create-space-handler'

export const command = 'create'

export const desc = 'Create a space'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space create --name \'Your Space Name\'')
    .option('name', {
      alias: 'n',
      describe: 'Name of the space to create',
      demandOption: true
    })
    .option('management-token', {
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('organization-id', {
      alias: 'org',
      describe: 'Organization owning the new space'
    })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

export async function spaceCreate (argv) {
  await assertLoggedIn(argv)

  let { organizationId } = argv
  const { cmaToken } = await getContext()
  const managementToken = argv.managementToken || cmaToken
  const client = await createManagementClient({
    accessToken: managementToken
  })

  const intentSystem = new IntentSystem()
  intentSystem.addHandler(createSpaceIntents({
    skipConfirm: argv.yes
  }))

  const loggingSystem = new LoggingSystem(logging)
  loggingSystem.addHandler(createSpaceLogging)

  const eventSystem = new EventSystem()
  eventSystem.attachSubsystem(intentSystem)
  eventSystem.attachSubsystem(loggingSystem)

  const dispatcher = eventSystem.dispatcher(CREATE_SPACE_HANDLER)

  if (!organizationId) {
    const result = await client.getOrganizations()

    if (result.items.length > 1) {
      dispatcher.dispatch('MULTIPLE_ORG_MEMBERSHIP')

      const organizationChoices = result.items
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((organization) => ({
          name: `${organization.name} (${organization.sys.id})`,
          value: organization.sys.id
        }), {})

      organizationId = await dispatcher.intent('SELECT_ORG', {
        organizations: organizationChoices
      })
    }
  }

  const space = await client.createSpace({
    name: argv.name
  }, organizationId)

  dispatcher.dispatch('SPACE_CREATED', { space })

  return space
}

export const handler = handle(spaceCreate)
