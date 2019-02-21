import { getContext } from '../../context'
import { confirmation } from '../../utils/actions'
import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { successEmoji } from '../../utils/emojis'
import { log, success } from '../../utils/log'
import normalizer from '../../utils/normalizer'
import { highlightStyle, warningStyle } from '../../utils/styles'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'

export const command = 'delete'
export const desc = 'Deletes a space'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space delete')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space to delete',
      nargs: 1
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('yes', {
      describe: 'Skip the confirmation question',
      default: false
    })
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

export async function spaceDelete (argv) {
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)
  const { spaceId } = await normalizer(argv)
  const { cmaToken } = await getContext()
  const managementToken = argv.managementToken || cmaToken
  const client = await createManagementClient({
    accessToken: managementToken
  })

  const space = await client.getSpace(spaceId)

  if (!argv.yes) {
    log(`You are about to delete your ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) space and all of its content. This cannot be undone.`)
    log()

    const confirm = await confirmation('Do you want to confirm the deletion?')
    log()

    if (!confirm) {
      log(warningStyle(`Space deletion aborted.`))
      return
    }
  }

  log()
  await space.delete()

  log()
  success(`${successEmoji} Your ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}) space was successfully deleted.`)
}

export const handler = handle(spaceDelete)
