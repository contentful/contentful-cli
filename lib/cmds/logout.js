import inquirer from 'inquirer'
import { getContext, setContext, storeContext } from '../context'

export const command = 'logout'

export const desc = 'Logout from Contentful'

export const handler = async function logout () {
  const context = await getContext()

  if (!context.cmaToken) {
    console.log('You are not logged in. Log in first to log out.')
    return
  }

  console.log('This will log you out by deleting the CMA token stored on your machine.')
  await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ready',
      message: 'Are you sure?',
      default: true
    }
  ])

  await setContext({ cmaToken: null })
  await storeContext()

  console.log('Successfully logged you out.')
}
