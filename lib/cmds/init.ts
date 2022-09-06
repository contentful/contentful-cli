import inquirer from 'inquirer'
import { Argv } from 'yargs'
import { handleAsyncError as handle } from '../utils/async'
import greetings from './init/greetings'
import success from './init/success'
import { getContext } from '../context'
import { login } from './login'
import { spaceCreate } from './space_cmds/create'
import { importSpace } from './space_cmds/import'
import initialContent from './init/content.json'
import { spaceUse } from './space_cmds/use'
import chalk from 'chalk'

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
  let managementToken = context.managementToken

  if (!context.managementToken) {
    managementToken = await login({ context })
  }

  if (!managementToken) return

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

  let space

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

    space = await spaceCreate({
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
  } else {
    space = await spaceUse({ context })
  }

  const environmentId = (await space.getEnvironments()).items[0].sys.id

  const { connectionType } = await inquirer.prompt({
    type: 'list',
    name: 'connectionType',
    prefix: '👓',
    message: 'How would you like to consume content in your code?',
    choices: [
      {
        name: `${chalk.magenta('GraphQL')}`,
        value: 'GraphQL'
      },
      {
        name: `${chalk.yellow('JS Client')}`,
        value: 'Contentful.js'
      },
      {
        name: 'REST API',
        value: 'rest'
      }
    ]
  })

  success({
    accessToken: context.managementToken,
    connectionType,
    spaceId: space.sys.id,
    environmentId
  })
}

export const handler = handle(init)
