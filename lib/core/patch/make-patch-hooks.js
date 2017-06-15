import _ from 'lodash'

import applyPatch from './apply-patch-set'
import PatchAbortedError from '../../cmds/content-type_cmds/errors/patch-aborted-error'
import UnknownActionError from '../../cmds/content-type_cmds/errors/unknown-action-error'
import { PATCH_HOOKS } from '../events/scopes'

function patchOmitsField (patch) {
  const omittedProperty = !!patch.path.match(/\/fields\/.+\/omitted/)
  const omitsField = patch.value

  return omittedProperty && omitsField
}

function maybeUpdateContentType (contentType, dryRun) {
  if (!dryRun) {
    return contentType.update()
  }
  return contentType
}

function maybeDeleteContentType (contentType, dryRun) {
  if (!dryRun) {
    return contentType.delete()
  }

  return contentType
}

export function maybePublishContentType (contentType, dryRun) {
  if (!dryRun) {
    return contentType.publish()
  }

  return contentType
}

function maybeUnpublishContentType (contentType, dryRun) {
  if (!contentType.isPublished()) {
    return contentType
  }

  if (!dryRun) {
    return contentType.unpublish()
  }

  return contentType
}

function isDeletedContentType (contentType) {
  return _.isEmpty(contentType.toPlainObject())
}

async function applyPatches (patches, contentType, helpers, dispatcher, options) {
  const hooks = {
    before: async (data) => {
      const confirmed = await dispatcher.intent('CONFIRM_CONTENT_TYPE_PATCH')

      if (!confirmed) {
        throw new PatchAbortedError()
      }
    },
    after: async (data) => {
      if (patchOmitsField(data.patch)) {
        data.contentType = await maybeUpdateContentType(data.contentType, options.dryRun)
        data.contentType = await maybePublishContentType(data.contentType, options.dryRun)
      }

      // TODO remove this
      if (isDeletedContentType(data.contentType)) {
        await maybeDeleteContentType(data.contentType, options.dryRun)
      }
    }
  }

  const patchResult = await applyPatch(patches, contentType, helpers, hooks)
  const updated = await maybeUpdateContentType(patchResult.contentType, options.dryRun)

  return {
    contentType: updated,
    patched: patchResult.patched
  }
}

export default async function (patchSet, contentType, helpers, eventSystem, options = {}) {
  const dispatcher = eventSystem.dispatcher(PATCH_HOOKS)

  let patchResult = {}
  if (!['create', 'delete', 'patch'].includes(patchSet.action)) {
    throw new UnknownActionError(patchSet.action)
  }

  if (patchSet.action === 'delete') {
    const confirmed = await dispatcher.intent('CONFIRM_CONTENT_TYPE_DELETE', { contentType })

    if (confirmed) {
      await maybeUnpublishContentType(contentType, options.dryRun)
      await maybeDeleteContentType(contentType, options.dryRun)

      dispatcher.dispatch('CONTENT_TYPE_DELETED', { contentType, dryRun: options.dryRun })
    }
  }

  if (patchSet.action === 'patch' || patchSet.action === 'create') {
    patchResult = await applyPatches(patchSet.patches, contentType, helpers, dispatcher, options)
  }

  return patchResult
}
