const logging = require('../../utils/log')
const { handleAsyncError: handle } = require('../../utils/async')
const { createManagementClient } = require('../../utils/contentful-clients')
const { spaceUse } = require('./use')

const { EventSystem } = require('../../core/events')
const { CREATE_SPACE_HANDLER } = require('../../core/events/scopes')

const { warningStyle } = require('../../utils/styles')
const { confirmation } = require('../../utils/actions')
const IntentSystem = require('../../core/event-handlers/intents')
const LoggingSystem = require('../../core/event-handlers/logging')

const createSpaceIntents = require('../../core/event-handlers/intents/create-space-handler')
const createSpaceLogging = require('../../core/event-handlers/logging/create-space-handler')

const { AbortedError } = require('../../guide/helpers')
const { getHeadersFromOption } = require('../../utils/headers')

module.exports.command = 'create'

module.exports.desc = 'Create a space'

module.exports.builder = yargs => {
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
      describe:
        'Use the created space as default space when the --space-id is skipped.',
      type: 'boolean'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog('Copyright 2019 Contentful')
}

async function spaceCreate(argv) {
  const {
    context,
    name,
    defaultLocale,
    yes,
    use,
    feature = 'space-create'
  } = argv

  const { managementToken } = context
  let { organizationId } = argv
  const client = await createManagementClient({
    feature,
    accessToken: managementToken,
    headers: getHeadersFromOption(argv.header)
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
    throw new AbortedError()
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
    await spaceUse({ spaceId: space.sys.id })
  }

  dispatcher.dispatch('SPACE_CREATED', { space })

  return space
}

module.exports.spaceCreate = spaceCreate

module.exports.handler = handle(spaceCreate)
