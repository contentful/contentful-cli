import { setContext, storeRuntimeConfig } from '../context.mjs'
import { confirmation } from '../utils/actions.mjs'
import { handleAsyncError as handle } from '../utils/async.mjs'
import { log, warning, success } from '../utils/log.mjs'

export const command = 'logout'

export const desc = 'Logout from Contentful'

export async function logout() {
  warning(
    'This will log you out by deleting the CMA token stored on your system.'
  )
  const confirmed = await confirmation('Do you want to log out now?')

  if (!confirmed) {
    log('Log out aborted by user.')
    return
  }
  await setContext({ managementToken: null })
  await storeRuntimeConfig()

  success('Successfully logged you out.')
}

export const handler = handle(logout)