import { getContext } from '../../../context'
import * as logging from '../../../utils/log'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'

export const command = 'create'

export const desc = 'Create an environment'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful environment create --name \'Your Environment Name\'')
    .option('name', {
      alias: 'n',
      describe: 'Name of the environment to create',
      demandOption: true
    })
    .option('space-id', {
      describe: 'ID of the space the environment will belong to',
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

  const environment = await space.createEnvironment({ name: argv.name })

  logging.success(`Successfully created environment ${environment.name} (${environment.sys.id})`)

  return environment
}

export const handler = handle(environmentCreate)
