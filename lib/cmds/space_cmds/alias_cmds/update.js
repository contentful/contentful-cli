import { success } from '../../../utils/log.mjs'
import { handleAsyncError as handle } from '../../../utils/async.mjs'
import { createManagementClient } from '../../../utils/contentful-clients.mjs'
import { getHeadersFromOption } from '../../../utils/headers.mjs'

export const command = 'update'

export const desc = 'Update an environment alias'

export const builder = yargs => {
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
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
}

export const environmentAliasUpdate = async function environmentAliasUpdate({
  context,
  aliasId,
  targetEnvironmentId,
  header
}) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-environment-alias-update',
    headers: getHeadersFromOption(header)
  })

  const space = await client.getSpace(activeSpaceId)

  let alias = await space.getEnvironmentAlias(aliasId)
  alias.environment.sys.id = targetEnvironmentId
  alias = await alias.update()
  success(
    `Successfully changed the target environment for alias ${alias.sys.id} to ${alias.environment.sys.id}`
  )

  return alias
}

export const handler = handle(environmentAliasUpdate)
