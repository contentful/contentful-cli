import Bluebird from 'bluebird'
import _ from 'lodash'

import applyPatch from './apply-patch'
import PatchAbortedError from '../errors/patch-aborted-error'
import UnknownActionError from '../errors/unknown-action-error'
import * as log from '../../../utils/log'

function patchOmitsField (patch) {
  const omittedProperty = !!patch.path.match(/\/fields\/.+\/omitted/)
  const omitsField = patch.value

  return omittedProperty && omitsField
}

function maybeUpdateContentType (contentType, dryRun) {
  if (!dryRun) {
    return contentType.update()
  }
}

function maybeDeleteContentType (contentType, dryRun) {
  if (!dryRun) {
    return contentType.delete()
  }
}

function maybePublishContentType (contentType, dryRun) {
  if (!dryRun) {
    return contentType.publish()
  }
}

function maybeUnpublishContentType (contentType, dryRun) {
  if (!contentType.isPublished()) {
    return
  }

  if (!dryRun) {
    return contentType.unpublish()
  }
}

function isDeletedContentType (contentType) {
  return _.isEmpty(contentType.toPlainObject())
}

async function applyPatches (patches, contentType, helpers, options) {
  const hooks = {
    before: async (patch, ct) => {
      let confirmed = true

      if (!options.skipConfirm) {
        confirmed = await helpers.confirmPatch()
      }

      if (!confirmed) {
        throw new PatchAbortedError()
      }
    },
    after: async (patch, ct) => {
      if (patchOmitsField(patch)) {
        await maybeUpdateContentType(contentType, options.dryRun)
        await maybePublishContentType(contentType, options.dryRun)
      }

      if (isDeletedContentType(ct)) {
        await maybeDeleteContentType(contentType, options.dryRun)
      }

      return Bluebird.resolve()
    }
  }

  const patchedContentType = await applyPatch(patches, contentType, helpers, hooks)

  return maybeUpdateContentType(patchedContentType, options.dryRun)
}

export default async function (patchSet, contentType, helpers, options = {}) {
  if (!['create', 'delete', 'patch'].includes(patchSet.action)) {
    throw new UnknownActionError(patchSet.action)
  }

  if (patchSet.action === 'delete') {
    const confirmed = await helpers.confirm(`Do you want to delete Content Type ${contentType.name}?`)

    if (confirmed) {
      await maybeUnpublishContentType(contentType, options.dryRun)
      await maybeDeleteContentType(contentType, options.dryRun)

      log.success(`Content Type "${contentType.name}" deleted ${options.dryRun ? '(DRY RUN)' : ''}`)
    }

    return
  }

  if (patchSet.action === 'patch' || patchSet.action === 'create') {
    return applyPatches(patchSet.patches, contentType, helpers, options)
  }
}
