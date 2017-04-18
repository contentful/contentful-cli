import inquirer from 'inquirer'
import { handler as loginHandler } from './login'
import { getContext } from '../context'
import { logWithFrame } from '../helpers'

export const command = 'guide'

export const desc = 'A guide introducing basic concepts of working with Contentful'

export const handler = async function guide () {
  const context = await getContext()

  if (!context.cmaToken) {
    console.log('You are not logged in. I have a good day, I will guide u even to the login process.')
    await loginHandler()
  }

  console.log('Okay lets go. First of all, we need a space to work with.')
  console.log()
  console.log('A space is pretty much equivalent to a database. It stores your content structure and the content itself.')

  const answersSpaceCreation = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'How should we do it?',
      choices: [
        {
          name: 'Create a new space',
          value: 'new'
        },
        {
          name: 'Use an existing space',
          value: 'existing'
        }
      ]
    }
  ])

  if (answersSpaceCreation.action === 'new') {
    console.log('So let us create a new space for u. We will execute the following command:')
    logWithFrame('contentful space create --name "Your name"')
  }

  if (answersSpaceCreation.action === 'existing') {
    console.log('To list your existing spaces and activate one, we will execute the following command:')
    logWithFrame('contentful space use --pick')
  }
}
