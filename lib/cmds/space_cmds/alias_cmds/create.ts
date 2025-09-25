import { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../../utils/async'
import { createPlainClient } from '../../../utils/contentful-clients'
import { getHeadersFromOption } from '../../../utils/headers'
import logging from '../../../utils/log'

export const command = 'create'

export const desc = 'Create an environment alias'

export const builder = (yargs: Argv) => {
  return yargs
    .usage(
      'Usage: contentful space alias create --alias-id staging --target-environment-id dev-test'
    )
    .option('alias-id', {
      alias: 'a',
      describe: 'ID of the alias to create',
      demandOption: true
    })
    .option('target-environment-id', {
      alias: 'e',
      describe: 'ID of the target environment',
      type: 'string',
      demandOption: true
    })
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space that the alias belongs to',
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

interface Params {
  context: {
    managementToken: string
    activeSpaceId: string
  }
  aliasId: string
  targetEnvironmentId: string
  header?: string
}

export const environmentAliasCreate = async function ({
  context,
  aliasId,
  targetEnvironmentId,
  header
}: Params) {
  const { managementToken, activeSpaceId } = context

  const client = await createPlainClient({
    accessToken: managementToken,
    feature: 'space-environment-alias-create',
    headers: getHeadersFromOption(header)
  })

  const alias = await client.environmentAlias.createWithId(
    { spaceId: activeSpaceId, environmentAliasId: aliasId },
    {
      environment: {
        sys: {
          type: 'Link',
          linkType: 'Environment',
          id: targetEnvironmentId
        }
      }
    }
  )

  logging.success(
    `Successfully created environment alias ${alias.sys.id} targeting environment ${alias.environment.sys.id}`
  )

  return alias
}

export const handler = handle(environmentAliasCreate)
