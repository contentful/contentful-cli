import _ from 'lodash'
import path from 'path'
import Bluebird from 'bluebird'

import ContentTypeProxy from '../../cmds/content-type_cmds/utils/content-type-proxy'
import { maybePublishContentType } from './make-patch-hooks'
import { PATCH_FILE_HANDLER } from '../events/scopes'

export default async function batchPatch (args, createContentfulClient, applyPatches, helpers, eventSystem) {
  const dispatcher = eventSystem.dispatcher(PATCH_FILE_HANDLER)

  const client = await createContentfulClient({
    accessToken: args.accessToken,
    headers: { 'X-Contentful-Beta-Content-Type-Migration': true }
  })
  const space = await client.getSpace(args.spaceId)

  const options = _.pick(args, ['yes', 'dryRun'])
  let patchResults = []

  for (let patchFilePath of args.patchFilePaths) {
    let patchFile
    try {
      patchFile = await helpers.readPatchFile(patchFilePath)
      const { base: fileName } = path.parse(patchFilePath)
      patchFile.fileName = fileName
    } catch (err) {
      if (err.code === 'EISDIR') {
        dispatcher.error('FILE_IS_DIRECTORY', {
          patchFilePath
        })
        continue
      }
      throw err
    }

    if (!patchFile.id) {
      dispatcher.error('MISSING_CONTENT_TYPE_ID', {
        patchFilePath
      })
      return
    }

    if (!patchFile.patches) {
      dispatcher.error('MISSING_PATCH_FILES', {
        patchFilePath
      })
      return
    }

    let contentType
    try {
      contentType = await space.getContentType(patchFile.id)
    } catch (e) {
      if (e.name === 'NotFound') {
        if (patchFile.action === 'delete') {
          dispatcher.dispatch('MISSING_CONTENT_TYPE', {
            contentTypeId: patchFile.id
          })
          continue
        }

        contentType = new ContentTypeProxy(patchFile.id, space)
      }
    }

    dispatcher.dispatch('APPLYING_PATCH', {
      contentTypeId: patchFile.id,
      patchFileName: patchFile.fileName
    })

    const patchResult = await applyPatches(patchFile, contentType, helpers, eventSystem, options)

    patchResults = [...patchResults, patchResult]

    if (!options.dryRun && patchResult.patched) {
      dispatcher.dispatch('PATCH_APPLIED', {
        contentTypeId: patchFile.id,
        patchFileName: patchFile.fileName
      })
    }
    // A patch result from a deletion doesn't have a "patched" property
    // so checking for falsiness is not enough here.
    if (options.dryRun === false && patchResult.patched === false) {
      dispatcher.dispatch('PATCH_NOT_APPLIED', {
        contentTypeId: patchFile.id,
        contentTypeName: contentType.name,
        patchFileName: patchFile.fileName
      })
    }
  }

  if (!options.dryRun) {
    await publishPatchResults(patchResults, maybePublishContentType, dispatcher)
  }
}

export async function publishPatchResults (patchResults, maybePublishContentType, dispatcher) {
  const changedCTs = patchResults
    .filter(patchResult => patchResult.patched)
    .map(patchResult => patchResult.contentType)

  if (!changedCTs.length) return

  const confirmed = await dispatcher.intent('CONFIRM_CONTENT_TYPE_PUBLISH')

  if (!confirmed) {
    dispatcher.dispatch('CONTENT_TYPES_NOT_PUBLISHED', {
      contentTypes: changedCTs
    })
    return
  }

  await Bluebird.map(changedCTs, (ct) => maybePublishContentType(ct))
  dispatcher.dispatch('CONTENT_TYPES_PUBLISHED', {
    contentTypes: changedCTs
  })
}
