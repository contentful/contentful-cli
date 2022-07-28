import { success } from '../../../utils/log.js'
import { handleAsyncError as handle } from '../../../utils/async.js'
import { createManagementClient } from '../../../utils/contentful-clients.js'
import { getHeadersFromOption } from '../../../utils/headers.js'

export const command = 'delete'

export const desc = 'Delete an environment'

export const builder = yargs => {
  return yargs
    .usage(
      "Usage: contentful space environment delete --environment-id 'staging'"
    )
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
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/delete',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

export async function environmentDelete({ context, environmentId, header }) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-delete',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)

  const environment = await space.getEnvironment(environmentId)

  await environment.delete()

  success(
    `Successfully deleted environment ${environment.name} (${environment.sys.id})`
  )

  return environment
}

export const handler = handle(environmentDelete)
