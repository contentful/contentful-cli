import open from 'open'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { getConfigPath, setContext, storeRuntimeConfig } from '../context'
import { confirmation } from '../utils/actions'
import { handleAsyncError as handle } from '../utils/async'
import { log } from '../utils/log'
import { highlightStyle, codeStyle, pathStyle } from '../utils/styles'
import { frame } from '../utils/text'
import { Argv } from 'yargs'

const APP_ID =
  '9f86a1d54f3d6f85c159468f5919d6e5d27716b3ed68fd01bd534e3dea2df864'
const REDIRECT_URI = 'https://www.contentful.com/developers/cli-oauth-page/'
const oAuthURL = `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=content_management_manage`

export const command = 'login'

export const desc = 'Login to Contentful'

export const builder = (yargs: Argv) =>
  yargs
    .usage('Usage: contentful login')
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/login',
        'Copyright 2019 Contentful'
      ].join('\n')
    )

interface Context {
  managementToken?: string
}

interface LoginProps {
  context: Context
  managementToken: string
}

export const login = async ({
  context,
  managementToken: managementTokenFlag
}: LoginProps) => {
  const { managementToken } = context

  let token
  if (managementTokenFlag) {
    token = managementTokenFlag
  } else {
    if (managementToken) {
      log()
      log(
        `Looks like you already stored a management token on your system. ${chalk.dim(
          `(Located at ${await getConfigPath()})`
        )}`
      )
      log(frame(`Your management token: ${managementToken}`))
      log(`Maybe you want to ${codeStyle('contentful logout')}?`)
      return managementToken
    }

    log(
      `A browser window will open where you will log in (or sign up if you don’t have an account), authorize this CLI tool and paste your ${highlightStyle(
        'CMA token'
      )} here:`
    )
    log()

    const confirmed = await confirmation('Continue login through the browser?')

    if (!confirmed) {
      log(
        chalk.red('Aborted!'),
        'please login to use contentful cli features!',
        `\nUsage: ${chalk.green('contentful')} ${chalk.cyan('login')}`
      )
      return
    }

    // We open the browser window only on Windows and OSX since this might fail or open the wrong browser on Linux.
    if (['win32', 'darwin'].includes(process.platform)) {
      await open(oAuthURL, {
        wait: false
      })
    } else {
      log(
        `Unable to open your browser automatically. Please open the following URI in your browser:\n\n${pathStyle(
          oAuthURL
        )}\n\n`
      )
    }

    const tokenAnswer = await inquirer.prompt([
      {
        type: 'password',
        name: 'managementToken',
        message: 'Paste your token here:',
        validate: val => /^[a-zA-Z0-9_-]{43,64}$/i.test(val.trim()) // token is 43 to 64 characters and accepts lower/uppercase characters plus `-` and `_`
      }
    ])

    token = tokenAnswer.managementToken
  }

  await setContext({
    managementToken: token
  })
  await storeRuntimeConfig()
  log()
  log(
    `Great! Your ${highlightStyle(
      'CMA token'
    )} is now stored on your system. ${chalk.dim(
      `(Located at ${await getConfigPath()})`
    )}`
  )
  log(`You can always run ${codeStyle('contentful logout')} to remove it.`)

  return token
}

export const handler = handle(login)
