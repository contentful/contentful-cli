const logging = require('../../../utils/log')
const { handleAsyncError: handle } = require('../../../utils/async')
const { createManagementClient } = require('../../../utils/contentful-clients')

module.exports.command = 'update'

module.exports.desc = 'Update an environment alias'

module.exports.builder = yargs => {
  return yargs
    .usage(
      'Usage: contentful space alias update --alias-id master --target-environment-id staging'
    )
    .option('alias-id', {
      alias: 'a',
      describe: 'Id of the alias to create',
      demandOption: true
    })
    .option('target-environment-id', {
      alias: 'e',
      describe: 'ID of the target environment',
      type: 'string'
    })
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space that the alias will belong to',
      type: 'string'
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
}

module.exports.environmentAliasUpdate = async function environmentAliasUpdate({
  context,
  aliasId,
  targetEnvironmentId
}) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-alias-update'
  })

  const space = await client.getSpace(activeSpaceId)

  let alias = await space.getEnvironmentAlias(aliasId)
  alias.environment.sys.id = targetEnvironmentId
  alias = await alias.update()
  logging.success(
    `Successfully updated alias ${alias.sys.id} aliased to environment ${alias.environment.sys.id}`
  )

  return alias
}

module.exports.handler = handle(module.exports.environmentAliasUpdate)
