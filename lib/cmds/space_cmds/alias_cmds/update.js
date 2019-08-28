import * as logging from '../../../utils/log'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'

export const command = 'update'

export const desc = 'Update an environment alias'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space alias update --alias-id master --environment-id staging')
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
    .epilog([
      'See more at:',
      'Environment ALiases is an [ALPHA] feature',
      'https://github.com/contentful/contentful-cli/tree/master/docs/space/alias/update',
      'Copyright 2019 Contentful, this is a BETA release'
    ].join('\n'))
}

export async function environmentAliasUpdate ({ context, aliasId, targetEnvironmentId }) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-alias-update'
  })

  const space = await client.getSpace(activeSpaceId)

  let alias = await space.getEnvironmentAlias(aliasId)
  alias.environment.sys.id = targetEnvironmentId
  alias = await alias.update()
  logging.success(`Successfully updated alias ${alias.sys.id} aliased to environment ${alias.environment.sys.id}`)

  return alias
}

export const handler = handle(environmentAliasUpdate)
