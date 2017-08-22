import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'

export const command = 'get'

export const desc = 'Show an extension'

export const builder = (yargs) => {
  return yargs
  .option('id', { type: 'string', demand: true, describe: 'Extension id' })
  .option('space-id', { type: 'string', describe: 'Space id' })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
}

async function extensionShow (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)
  const result = await space.getUiExtension(argv.id)
  console.log(result)
}

export const handler = handle(extensionShow)
