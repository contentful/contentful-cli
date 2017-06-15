import { PATCH_HOOKS } from '../../events/scopes'

const patchHooksLogging = {
  scopes: [PATCH_HOOKS],
  messages: {
    success: {
      'CONTENT_TYPE_DELETED': ({ contentType, dryRun }) => `Content Type "${contentType.name}" deleted ${dryRun ? '(DRY RUN)' : ''}`
    }
  }
}

export default patchHooksLogging
