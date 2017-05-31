import _ from 'lodash'
import path from 'path'

import ContentTypeProxy from '../content-type_cmds/utils/content-type-proxy'
import { successEmoji } from '../../utils/emojis'

export default async function batchPatch (args, createContentfulClient, applyPatches, helpers, logging) {
  const client = createContentfulClient({
    accessToken: args.accessToken,
    headers: { 'X-Contentful-Beta-Content-Type-Migration': true }
  })
  const space = await client.getSpace(args.spaceId)

  for (let patchFilePath of args.patchFilePaths) {
    let patchFile
    try {
      patchFile = await helpers.readPatchFile(patchFilePath)
      const { base: fileName } = path.parse(patchFilePath)
      patchFile.fileName = fileName
    } catch (err) {
      if (err.code === 'EISDIR') {
        logging.error(`Ignoring ${patchFilePath}, it is a directory`)
        continue
      }
      throw err
    }

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
    const options = _.pick(args, ['yes', 'dryRun'])

    logging.log(`Patch File: "${patchFile.fileName}"`)
    logging.log(`Content Type: "${patchFile.id}"`)
    const patchResult = await applyPatches(patchFile, contentType, helpers, logging, options)

    if (!options.dryRun && patchResult.patched) {
      logging.log(`${successEmoji} Patches applied`)
    }
    // A patch result from a deletion doesn't have a "patched" property
    // so checking for falsiness is not enough here.
    if (options.dryRun === false && patchResult.patched === false) {
      logging.log(`No changes for content type "${contentType.name}"`)
    }
  }
}
