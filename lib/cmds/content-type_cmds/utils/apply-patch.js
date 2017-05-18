import { log } from '../../../utils/log'

export default async function (patches, contentType, helpers, hooks) {
  let noChanges = true

  for (const patch of patches) {
    const path = helpers.transformPath(contentType, patch.path)
    patch.path = path

    const originalContentTypeData = contentType.toPlainObject()
    const contentTypeData = Object.assign({}, contentType.toPlainObject())

    helpers.applyPatch(contentTypeData, patch)

    const isDifferent = helpers.hasChanged(originalContentTypeData, contentTypeData)
    if (!isDifferent) {
      continue
    }

    helpers.prettyDiff(originalContentTypeData, contentTypeData)
    noChanges = false
    await hooks.before(patch, contentType)
    helpers.applyPatch(contentType, patch)
    await hooks.after(patch, contentType)
  }

  if (noChanges) log(`No changes for ${contentType.name}`)

  return contentType
}
