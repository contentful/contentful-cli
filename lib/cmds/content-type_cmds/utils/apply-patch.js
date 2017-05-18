function diffPatchChanges (contentType, patch, helpers) {
  const originalContentTypeData = contentType.toPlainObject()
  const contentTypeData = Object.assign({}, contentType.toPlainObject())

  helpers.applyPatch(contentTypeData, patch)
  helpers.prettyDiff(originalContentTypeData, contentTypeData)
}

export default async function (patches, contentType, helpers, hooks) {
  for (const patch of patches) {
    const path = helpers.transformPath(contentType, patch.path)
    patch.path = path

    diffPatchChanges(contentType, patch, helpers)

    await hooks.before(patch, contentType)
    helpers.applyPatch(contentType, patch)
    await hooks.after(patch, contentType)
  }

  return contentType
}
