import inquirer from 'inquirer'
import { Argv } from 'yargs'
import { handleAsyncError as handle } from '../utils/async'
import greetings from './init/greetings'
import success from './init/success'
import { getContext } from '../context'
import { login } from './login'
import chalk from 'chalk'
import { getPreviewApiKey } from './init/apikey'
import { getSpace } from './init/space'

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

  if (!context.managementToken) {
    context.managementToken = await login({ context })
  }

  if (!context.managementToken)
    return console.log(
      chalk.red("We couldn't find your access token, please login again!")
    )

  const space = await getSpace(context)

  const environmentId =
    (await space.getEnvironments()).items[0].sys.id || 'master'
  const apiKey = await getPreviewApiKey(space, environmentId)

  const { connectionType } = await inquirer.prompt({
    type: 'list',
    name: 'connectionType',
    prefix: '👓',
    message: 'How would you like to consume content in your code?',
    choices: [
      {
        name: `${chalk.blue('React')}`,
        value: 'React'
      },
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
        value: 'REST API'
      }
    ]
  })

  success({
    accessToken: apiKey,
    connectionType,
    spaceId: space.sys.id,
    environmentId
  })
}

export const handler = handle(init)
