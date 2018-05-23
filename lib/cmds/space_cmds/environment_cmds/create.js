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
    .epilog([
      'See more at:',
      'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/create',
      'Copyright 2018 Contentful, this is a BETA release'
    ].join('\n'))
}

export async function environmentCreate (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)

  const options = {}
  if (argv.name) {
    options.name = argv.name
  }

  const environment = await space.createEnvironmentWithId(argv.environmentId, options)

  logging.success(`Successfully created environment ${environment.name} (${environment.sys.id})`)

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
