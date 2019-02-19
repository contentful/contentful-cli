import Promise from 'bluebird'
import { getContext } from '../../../context'
import * as logging from '../../../utils/log'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'

export const command = 'create'

export const desc = 'Create an environment'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space environment create --name \'Your Environment Name\'')
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
      describe: 'ID of the source environment to create the new environment from',
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
    .epilog([
      'See more at:',
      'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/create',
      'Copyright 2018 Contentful, this is a BETA release'
    ].join('\n'))
}

export async function environmentCreate (argv) {
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()

  const managementToken = argv.managementToken || cmaToken
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-create'
  })

  const space = await client.getSpace(spaceId)

  const options = {}
  const source = []
  if (argv.name) {
    options.name = argv.name
  }
  if (argv.source) {
    source.push(argv.source)
  }
  const environment = await space.createEnvironmentWithId(argv.environmentId, options, ...source)

  logging.success(`Successfully created environment ${environment.name} (${environment.sys.id}) ${argv.source ? `with source ${argv.source}` : ''}`)

  if (argv.awaitProcessing) {
    const DELAY = 3000
    const MAX_NUMBER_OF_TRIES = 10
    let count = 0

    logging.log('Waiting for processing...')

    while (count < MAX_NUMBER_OF_TRIES) {
      const status = (await space.getEnvironment(environment.sys.id)).sys.status.sys.id

      if (status === 'ready' || status === 'failed') {
        if (status === 'ready') {
          logging.success(`Successfully processed new environment ${environment.name} (${environment.sys.id})`)
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

export const handler = handle(environmentCreate)
