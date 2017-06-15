import { PATCH_FILE_HANDLER } from '../../events/scopes'
import * as helpers from '../../patch/helpers'

const createPatchFileHandlerIntents = (config) => {
  const patchFileHandlerIntents = {
    scopes: [PATCH_FILE_HANDLER],
    intents: {
      'CONFIRM_CONTENT_TYPE_PUBLISH': async () => {
        if (config.skipConfirm) {
          return true
        }

        return helpers.confirm('Your content types have been saved as drafts. Would you like to publish them now?')
      }
    }
  }

  return patchFileHandlerIntents
}

export default createPatchFileHandlerIntents
