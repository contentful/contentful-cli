import inquirer from 'inquirer'

import { PATCH_HOOKS } from '../../events/scopes'
import * as helpers from '../../patch/helpers'

const createPatchHookIntents = (config) => {
  const patchHookIntents = {
    scopes: [PATCH_HOOKS],
    intents: {
      'CONFIRM_CONTENT_TYPE_DELETE': async ({ contentType }) => {
        if (config.skipConfirm) {
          return true
        }

        return helpers.confirm(`Do you want to delete Content Type ${contentType.name}?`)
      },
      'CONFIRM_CONTENT_TYPE_PATCH': async () => {
        if (config.skipConfirm) {
          return true
        }

        const { applyPatch } = await inquirer.prompt([{
          type: 'confirm',
          name: 'applyPatch',
          message: 'Do you want to apply this patch?',
          default: true
        }])

        return applyPatch
      }
    }
  }

  return patchHookIntents
}

export default createPatchHookIntents
