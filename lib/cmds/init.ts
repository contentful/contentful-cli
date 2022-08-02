import { Argv } from 'yargs'
import inquirer from 'inquirer'
import { handleAsyncError as handle } from '../utils/async'
import greetings from './init/greetings'
import chalk from 'chalk'

export const command = 'init'

export const desc = 'Get started with Contentful'

export const builder = (yargs: Argv) => {
  return yargs
    .usage('Start a new project or see how to interact with an existing one!')
    .epilog('Your Contentful Guide: https://contentful.com/developers')
}

const init = async () => {
  greetings()
  const { login } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'login',
      prefix: '🔒',
      message: `You are ${chalk.red(
        'not'
      )} logged in, continue login in browser?`
    }
  ])
  if (!login)
    return console.log(
      chalk.red('Please login to take advantage of contentful cli features!'),
      `\nUse: ${chalk.green('contentful')} ${chalk.cyan('login')}`
    )
}

export const handler = handle(init)
