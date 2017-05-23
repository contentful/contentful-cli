import { getContext } from '../../../context'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../utils/contentful-clients'
import { successEmoji } from '../../../utils/emojis'
import { success } from '../../../utils/log'
import { highlightStyle } from '../../../utils/styles'
import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'
import normalizer from '../../../utils/normalizer'

export const command = 'create'

export const desc = 'Create a spaces'

export const builder = (yargs) => {
  return yargs
    .example('contentful accesstoken create --name \'Your token name\' --description \'Your token description\'')
    .option('name', {
      alias: 'n',
      describe: 'Name of the Token to create',
      demandOption: true
    })
    .option('description', {
      alias: 'desc',
      describe: 'Description giving more detailed information about the usage of the token'
    })
    .option('silent', {
      describe: 'Suppress command output',
      default: false
    })
}

export async function accessTokenCreate (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)
  const { spaceId } = await normalizer(argv)
  const { cmaToken } = await getContext()

  const client = createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)

  const accessToken = await space.createApiKey({
    name: argv.name,
    description: argv.description
  })

  if (!argv.silent) {
    success(`${successEmoji} Successfully created access token ${highlightStyle(accessToken.name)} (${highlightStyle(accessToken.accessToken)})`)
  }

  return space
}

export const handler = handle(accessTokenCreate)
