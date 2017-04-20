import inquirer from 'inquirer'

import { getContext, setContext, storeContext } from '../context'
import { log } from '../utils'

export const command = 'logout'

export const desc = 'Logout from Contentful'

export const handler = async function logout () {
  const context = await getContext()

  if (!context.cmaToken) {
    log('You are not logged in. Log in first to log out.')
    return
  }

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
  await storeContext()

  log('Successfully logged you out.')
}
