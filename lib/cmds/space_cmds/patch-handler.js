import _ from 'lodash'

import ContentTypeProxy from '../content-type_cmds/utils/content-type-proxy'
import { successEmoji } from '../../utils/emojis'

export default async function batchPatch (args, createContentfulClient, applyPatches, helpers, logging) {
  const client = createContentfulClient({
    accessToken: args.accessToken,
    headers: { 'X-Contentful-Beta-Content-Type-Migration': true }
  })
  const space = await client.getSpace(args.spaceId)

  for (let patchFilePath of args.patchFilePaths) {
    const patchFile = await helpers.readPatchFile(patchFilePath)

    if (!patchFile.id) {
      return logging.error(`No content type id provided in ${patchFilePath}`)
    }

    if (!patchFile.patches) {
      return logging.error(`No patches provided in ${patchFilePath}`)
    }

    let contentType
    try {
      contentType = await space.getContentType(patchFile.id)
    } catch (e) {
      if (e.name === 'NotFound') {
        if (patchFile.action === 'delete') {
          logging.log(`Content Type "${patchFile.id}" doesn't exist or has already been deleted`)
          continue
        }

        contentType = new ContentTypeProxy(patchFile.id, space)
      }
    }
    const options = _.pick(args, ['skipConfirm', 'dryRun'])
    await applyPatches(patchFile, contentType, helpers, options)

    if (!options.dryRun) {
      logging.log(`${successEmoji} Patches applied`)
    }
  }
}
