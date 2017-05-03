import inquirer from 'inquirer'

import { setContext, storeRuntimeConfig } from '../context'
import { handleAsyncError as handle } from '../utils/async'
import { log } from '../utils/log'
import { checkLoggedIn } from '../utils/validators'

export const command = 'logout'

export const desc = 'Logout from Contentful'

export async function logout () {
  await checkLoggedIn()

  log('This will log you out by deleting the CMA token stored on your machine.')
  await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ready',
      message: 'Are you sure?',
      default: false
    }
  ])

  await setContext({ cmaToken: null })
  await storeRuntimeConfig()

  log('Successfully logged you out.')
}

export const handler = handle(logout)
