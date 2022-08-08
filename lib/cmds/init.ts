import inquirer from 'inquirer'
import chalk from 'chalk'
import { Argv } from 'yargs'
import { handleAsyncError as handle } from '../utils/async'
import greetings from './init/greetings'
import { getContext } from '../context'
import { login } from './login'

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
}

export const handler = handle(init)
