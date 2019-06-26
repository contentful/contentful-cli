import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { successEmoji } from '../../../utils/emojis'
import { success } from '../../../utils/log'
import paginate from '../../../utils/pagination'
import { highlightStyle } from '../../../utils/styles'

export const command = 'create'

export const desc = 'Create a delivery access token'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful accesstoken create --name \'Your token name\' --description \'Your token description\'')
    .option('name', {
      alias: 'n',
      describe: 'Name of the Token to create',
      demandOption: true
    })
    .option('description', {
      alias: 'desc',
      describe: 'Description giving more detailed information about the usage of the Token'
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('space-id', { alias: 's', type: 'string', describe: 'Space id' })
    .option('silent', {
      describe: 'Suppress command output',
      default: false
    })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

export async function accessTokenCreate (argv) {
  const { context, name, description, silent, feature = 'space-access_token-create' } = argv
  await assertLoggedIn(context)
  await assertSpaceIdProvided(context)

  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature
  })

  const space = await client.getSpace(activeSpaceId)
  const accessTokens = await paginate({ client: space, method: 'getApiKeys' })

  let accessToken = accessTokens.items.find((key) => key.name === name)

  if (accessToken) {
    if (!silent) {
      success(`${successEmoji} Successfully returned already existing access token ${highlightStyle(accessToken.name)} (${highlightStyle(accessToken.accessToken)})`)
    }
    return accessToken
  }

  accessToken = await space.createApiKey({
    name,
    description
  })

  if (!silent) {
    success(`${successEmoji} Successfully created access token ${highlightStyle(accessToken.name)} (${highlightStyle(accessToken.accessToken)})`)
  }

  return accessToken
}

export const handler = handle(accessTokenCreate)
