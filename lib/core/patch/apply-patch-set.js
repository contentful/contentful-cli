import _ from 'lodash'

export default async function applyPatch (patches, contentType, helpers, hooks) {
  let patched = false
  for (const patch of patches) {
    // TODO squas the two lines below
    const path = helpers.transformPath(contentType, patch.path)
    patch.path = path

    const originalContentTypeData = _.omit(contentType.toPlainObject(), ['sys'])
    const contentTypeData = _.cloneDeep(originalContentTypeData)

    helpers.applyPatch(contentTypeData, patch)

    const isDifferent = helpers.hasChanged(originalContentTypeData, contentTypeData)
    if (!isDifferent) {
      continue
    }

    helpers.prettyDiff(originalContentTypeData, contentTypeData)
    const hookData = { patch, contentType }
    await hooks.before(hookData)
    helpers.applyPatch(hookData.contentType, hookData.patch)
    await hooks.after(hookData)

    contentType = hookData.contentType
    patched = true
  }

  return {
    contentType,
    patched
  }
}
