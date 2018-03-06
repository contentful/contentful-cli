import { getContext } from '../../../context'
import * as logging from '../../../utils/log'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'

export const command = 'delete'

export const desc = 'Delete an environment'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful environment delete --environment-id \'staging\'')
    .option('environment-id', {
      alias: 'e',
      describe: 'Id of the environment to delete',
      demandOption: true
    })
    .option('space-id', {
      describe: 'ID of the space that holds the environment',
      type: 'string'
    })
    .epilog([
      'See more at:',
      'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/delete',
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

  const environment = await space.getEnvironment(argv.environmentId)

  await environment.delete()

  logging.success(`Successfully deleted environment ${environment.name} (${environment.sys.id})`)

  return environment
}

export const handler = handle(environmentCreate)
