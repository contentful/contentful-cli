const logging = require('../../../utils/log')
const { handleAsyncError: handle } = require('../../../utils/async')
const { createManagementClient } = require('../../../utils/contentful-clients')

module.exports.command = 'delete'

module.exports.desc = 'Delete an environment'

module.exports.builder = yargs => {
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
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/space/environment/delete',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

async function environmentDelete({ context, environmentId }) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-delete'
  })

  const space = await client.getSpace(activeSpaceId)

  const environment = await space.getEnvironment(environmentId)

  await environment.delete()

  logging.success(
    `Successfully deleted environment ${environment.name} (${environment.sys.id})`
  )

  return environment
}

module.exports.environmentDelete = environmentDelete

module.exports.handler = handle(environmentDelete)
