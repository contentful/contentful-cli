const Promise = require('bluebird')
const logging = require('../../../utils/log')
const { handleAsyncError: handle } = require('../../../utils/async')
const { createManagementClient } = require('../../../utils/contentful-clients')

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
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/create',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

async function environmentCreate({
  context,
  name,
  source,
  awaitProcessing,
  environmentId
}) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-create'
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
    const DELAY = 3000
    const MAX_NUMBER_OF_TRIES = 10
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

  return environment
}

module.exports.environmentCreate = environmentCreate

module.exports.handler = handle(environmentCreate)
