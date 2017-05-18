import Bluebird from 'bluebird'
import _ from 'lodash'

import applyPatch from './apply-patch'
import PatchAbortedError from '../errors/patch-aborted-error'

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

function isDeletedContentType (contentType) {
  return _.isEmpty(contentType.toPlainObject())
}

export default async function (patches, contentType, helpers, options = {}) {
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
