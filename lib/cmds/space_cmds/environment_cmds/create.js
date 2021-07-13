const Promise = require('bluebird')
const logging = require('../../../utils/log')
const { handleAsyncError: handle } = require('../../../utils/async')
const { createManagementClient } = require('../../../utils/contentful-clients')
const { getHeadersFromOption } = require('../../../utils/headers')

module.exports.command = 'create'

module.exports.desc = 'Create an environment'

module.exports.builder = yargs => {
  return yargs
    .usage(
      "Usage: contentful space environment create --name 'Your Environment Name'"
    )
    .option('environment-id', {
      alias: 'e',
      describe: 'Id of the environment to create',
      demandOption: true
    })
    .option('name', {
      alias: 'n',
      describe: 'Name of the environment to create',
      demandOption: true
    })
    .option('source', {
      alias: 'src',
      describe:
        'ID of the source environment to create the new environment from',
      type: 'string'
    })
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space that the environment will belong to',
      type: 'string'
    })
    .option('await-processing', {
      alias: 'w',
      describe: 'Wait until the environment is processed and ready',
      type: 'boolean',
      default: false
    })
    .option('processing-timeout', {
      alias: 't',
      describe:
        'Await processing times out after specified number of minutes (only is applied if await-processing is set)',
      type: 'number',
      default: 5
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/create',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

async function checkAwaitProcessing(space, environment, timeoutInMinutes) {
  const DELAY = 3000
  const timeoutInMilliseconds = Math.ceil(timeoutInMinutes * 60 * 1000)
  const MAX_NUMBER_OF_TRIES = Math.ceil(timeoutInMilliseconds / DELAY)
  let count = 0

  logging.log('Waiting for processing...')

  while (count < MAX_NUMBER_OF_TRIES) {
    const status = (await space.getEnvironment(environment.sys.id)).sys.status
      .sys.id

    if (status === 'ready' || status === 'failed') {
      if (status === 'ready') {
        logging.success(
          `Successfully processed new environment ${environment.name} (${environment.sys.id})`
        )
      } else {
        logging.error('Environment creation failed')
      }
      break
    }

    await Promise.delay(DELAY)
    count++
  }
}

async function environmentCreate({
  context,
  name,
  source,
  awaitProcessing,
  processingTimeout,
  environmentId,
  header
}) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-create',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)

  const options = {}
  if (name) {
    options.name = name
  }

  const environment = source
    ? await space.createEnvironmentWithId(environmentId, options, source)
    : await space.createEnvironmentWithId(environmentId, options)

  logging.success(
    `Successfully created environment ${environment.name} (${
      environment.sys.id
    }) ${source ? `with source ${source}` : ''}`
  )

  if (awaitProcessing) {
    await checkAwaitProcessing(space, environment, processingTimeout)
    const status = (await space.getEnvironment(environment.sys.id)).sys.status
      .sys.id

    if (!(status === 'ready' || status === 'failed')) {
      logging.log(
        `The environment is not ready and the awaiting processing time is over`
      )
    }
  }

  return environment
}

module.exports.environmentCreate = environmentCreate

module.exports.handler = handle(environmentCreate)
