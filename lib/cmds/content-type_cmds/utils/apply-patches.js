import _ from 'lodash'

import applyPatch from './apply-patch'
import PatchAbortedError from '../errors/patch-aborted-error'
import UnknownActionError from '../errors/unknown-action-error'

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

function maybePublishContentType (contentType, dryRun) {
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

async function applyPatches (patches, contentType, helpers, options) {
  const hooks = {
    before: async (data) => {
      let confirmed = true

      if (!options.skipConfirm) {
        confirmed = await helpers.confirmPatch()
      }

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

  const patchedContentType = await applyPatch(patches, contentType, helpers, hooks)

  return maybeUpdateContentType(patchedContentType, options.dryRun)
}

export default async function (patchSet, contentType, helpers, log, options = {}) {
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
    const originalContentTypeData = _.cloneDeep(contentType.toPlainObject())
    const patchedContentType = await applyPatches(patchSet.patches, contentType, helpers, options)
    const patchedContentTypeData = patchedContentType.toPlainObject()

    if (patchSet.action === 'patch' && !helpers.hasChanged(patchedContentTypeData, originalContentTypeData)) {
      log.log(`No changes for Content Type "${contentType.name}"`)
    }
  }
}
