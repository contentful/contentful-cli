import * as logging from '../../../utils/log'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'

export const command = 'delete'

export const desc = 'Delete an environment'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space environment delete --environment-id \'staging\'')
    .option('environment-id', {
      alias: 'e',
      describe: 'Id of the environment to delete',
      demandOption: true
    })
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space that holds the environment',
      type: 'string'
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .epilog([
      'See more at:',
      'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/delete',
      'Copyright 2018 Contentful, this is a BETA release'
    ].join('\n'))
}

export async function environmentDelete (argv) {
  const { context, environmentId } = argv
  await assertLoggedIn(context)
  await assertSpaceIdProvided(context)

  const { cmaToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: cmaToken,
    feature: 'space-environment-delete'
  })

  const space = await client.getSpace(activeSpaceId)

  const environment = await space.getEnvironment(environmentId)

  await environment.delete()

  logging.success(`Successfully deleted environment ${environment.name} (${environment.sys.id})`)

  return environment
}

export const handler = handle(environmentDelete)
