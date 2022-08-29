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
  const context = await getContext()

  greetings()

  if (!context.managementToken)
    await login({
      context
    })
}

export const handler = handle(init)
