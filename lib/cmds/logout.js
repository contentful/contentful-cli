import { setContext, storeRuntimeConfig } from '../context'
import { confirmation } from '../utils/actions'
import { handleAsyncError as handle } from '../utils/async'
import { log, warning, success } from '../utils/log'
import { assertLoggedIn } from '../utils/assertions'

export const command = 'logout'

export const desc = 'Logout from Contentful'

export async function logout () {
  await assertLoggedIn()

  warning('This will log you out by deleting the CMA token stored on your machine.')
  const confirm = await confirmation('Do you want to log out now?')

  if (confirm) {
    await setContext({ cmaToken: null })
    await storeRuntimeConfig()

    success('Successfully logged you out.')
    return
  }
  log('Log out aborted by user.')
}

export const handler = handle(logout)
