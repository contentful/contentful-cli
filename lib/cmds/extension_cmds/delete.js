import { getContext } from '../../context'
import { createManagementClient } from '../../utils/contentful-clients'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { handleAsyncError as handle } from '../../utils/async'
import { log } from '../../utils/log'

export const command = 'delete'

export const desc = 'Delete an extension'

export const builder = (yargs) => {
  return yargs
  .option('id', { type: 'string', demand: true, describe: 'Extension id' })
  .option('space-id', { type: 'string', describe: 'Space id' })
  .epilog('Copyright 2017 Contentful, this is a BETA release')
}

async function extensionDelete (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)

  const { cmaToken, activeSpaceId } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)
  const extension = await space.getUiExtension(argv.id)

  await extension.delete()

  log(`Successfully deleted extension with ID ${argv.id}`)
}

export const handler = handle(extensionDelete)
