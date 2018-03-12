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
      describe: 'Id of the environment to create'
    })
    .option('name', {
      alias: 'n',
      describe: 'Name of the environment to create'
    })
    .option('space-id', {
      describe: 'ID of the space that the environment will belong to',
      type: 'string'
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

  let environment
  if (argv.environmentId) {
    environment = await space.createEnvironmentWithId(argv.environmentId, options)
  } else {
    environment = await space.createEnvironment(options)
  }

  logging.success(`Successfully created environment ${environment.name} (${environment.sys.id})`)

  return environment
}

export const handler = handle(environmentCreate)
