import * as logging from '../../utils/log'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn } from '../../utils/assertions'
import { spaceUse } from './use'

import { EventSystem } from '../../core/events'
import { CREATE_SPACE_HANDLER } from '../../core/events/scopes'

import { warningStyle } from '../../utils/styles'
import { confirmation } from '../../utils/actions'
import IntentSystem from '../../core/event-handlers/intents'
import LoggingSystem from '../../core/event-handlers/logging'

import createSpaceIntents from '../../core/event-handlers/intents/create-space-handler'
import createSpaceLogging from '../../core/event-handlers/logging/create-space-handler'

export const command = 'create'

export const desc = 'Create a space'

export const builder = yargs => {
  return yargs
    .usage("Usage: contentful space create --name 'Your Space Name'")
    .option('name', {
      alias: 'n',
      describe: 'Name of the space to create',
      demandOption: true
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('organization-id', {
      alias: 'org',
      describe: 'Organization owning the new space'
    })
    .option('yes', {
      alias: 'y',
      describe:
        'Confirm space creation without prompt, be aware this may result in extra monthly charges depend on your subscription'
    })
    .option('default-locale', {
      alias: 'l',
      describe: 'The default locale of the new space',
      type: 'string'
    })
    .option('use', {
      alias: 'u',
      describe: 'Use the created space as default space when the --space-id is skipped.',
      type: 'boolean'
    })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

export async function spaceCreate (argv) {
  const { context, name, defaultLocale, yes, use, feature = 'space-create' } = argv
  await assertLoggedIn(context)

  const {cmaToken} = context
  let { organizationId } = argv
  const client = await createManagementClient({
    accessToken: cmaToken,
    feature
  })

  logging.log(
    warningStyle(`Please be aware that adding new spaces to your subscription,
beyond the free ‘Micro’ space included in each subscription,
will result in extra monthly charges.
More information on available space types and their prices can be found on
the Pricing page: https://www.contentful.com/pricing/?faq_category=payments&faq=what-type-of-spaces-can-i-have#what-type-of-spaces-can-i-have`)
  )

  let confirm = false
  if (!yes) {
    confirm = await confirmation(`Do you want to confirm the space creation?`)
  } else {
    confirm = true
  }

  logging.log()

  if (!confirm) {
    logging.log(warningStyle(`Space creation aborted.`))
    return
  }
  const intentSystem = new IntentSystem()
  intentSystem.addHandler(
    createSpaceIntents({
      skipConfirm: yes
    })
  )

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
        .map(
          organization => ({
            name: `${organization.name} (${organization.sys.id})`,
            value: organization.sys.id
          }),
          {}
        )

      organizationId = await dispatcher.intent('SELECT_ORG', {
        organizations: organizationChoices
      })
    }
  }

  const space = await client.createSpace(
    {
      name,
      defaultLocale
    },
    organizationId
  )

  if (use) {
    await spaceUse({spaceId: space.sys.id})
  }

  dispatcher.dispatch('SPACE_CREATED', { space })

  return space
}

export const handler = handle(spaceCreate)
