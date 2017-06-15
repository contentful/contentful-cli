import { successEmoji } from '../../../utils/emojis'
import { PATCH_FILE_HANDLER } from '../../events/scopes'

const patchFileHandlerLogging = {
  scopes: [PATCH_FILE_HANDLER],
  messages: {
    error: {
      'FILE_IS_DIRECTORY': ({ patchFilePath }) => `Ignoring ${patchFilePath}, it is a directory`,
      'MISSING_CONTENT_TYPE_ID': ({ patchFilePath }) => `No content type id provided in ${patchFilePath}`,
      'MISSING_PATCH_FILES': ({ patchFilePath }) => `No patches provided in ${patchFilePath}`
    },
    info: {
      'MISSING_CONTENT_TYPE': ({ contentTypeId }) => `Content Type "${contentTypeId}" doesn't exist or has already been deleted`,
      'APPLYING_PATCH': ({ contentTypeId, patchFileName }) => `Patch File: "${patchFileName}"\nContent Type: "${contentTypeId}"`,
      'PATCH_APPLIED': () => `${successEmoji} Patches applied`,
      'PATCH_NOT_APPLIED': ({ contentTypeName }) => `No changes for content type "${contentTypeName}"`,
      'CONTENT_TYPES_NOT_PUBLISHED': () => 'Your content types have been saved as drafts, not published.',
      'CONTENT_TYPES_PUBLISHED': () => `${successEmoji} Content types published`
    }
  }
}

export default patchFileHandlerLogging
