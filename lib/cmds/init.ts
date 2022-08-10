import inquirer from 'inquirer'
import { Argv } from 'yargs'
import { handleAsyncError as handle } from '../utils/async'
import greetings from './init/greetings'
import { getContext } from '../context'
import { login } from './login'
import { spaceCreate } from './space_cmds/create'
import { importSpace } from './space_cmds/import'
import initialContent from './init/content.json'

export const command = 'init'

export const desc = 'Get started with Contentful'

export const builder = (yargs: Argv) => {
  return yargs
    .usage('Start a new project or see how to interact with an existing one!')
    .epilog('Your Contentful Guide: https://contentful.com/developers')
}

export const init = async () => {
  greetings()

  const context = await getContext()
  const managementToken = context.managementToken
  await login({
    context,
    managementToken
  })

  const { newSpace } = await inquirer.prompt([
    {
      type: 'list',
      name: 'newSpace',
      message: 'Do you want to create a new space or use an existing one?',
      choices: [
        {
          name: 'Create new space',
          value: true
        },
        {
          name: 'Use existing space',
          value: false
        }
      ]
    }
  ])
  if (newSpace) {
    const { spaceName, content } = await inquirer.prompt([
      {
        type: 'input',
        name: 'spaceName',
        message: 'What should be the name for the new created space?',
        validate: name => name !== '' || 'Space name is required'
      },
      {
        type: 'confirm',
        name: 'content',
        message: ({ spaceName }) =>
          `Do you want to have example content in ${spaceName}?`
      }
    ])

    const space = await spaceCreate({
      context,
      name: spaceName
    })

    if (content) {
      await importSpace({
        context: {
          ...context,
          activeSpaceId: space.sys.id
        },
        content: initialContent
      })
    }
  }
}

export const handler = handle(init)
