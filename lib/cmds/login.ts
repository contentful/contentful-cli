import open from 'open'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { setContext, storeRuntimeConfig } from '../context'
import { confirmation } from '../utils/actions'
import { handleAsyncError as handle } from '../utils/async'
import { highlightStyle, pathStyle } from '../utils/styles'
import { Argv } from 'yargs'
import { tokenInfo } from '../utils/token-info'
import { copyright } from '../utils/copyright'

const APP_ID =
  '9f86a1d54f3d6f85c159468f5919d6e5d27716b3ed68fd01bd534e3dea2df864'
const REDIRECT_URI = 'https://www.contentful.com/developers/cli-oauth-page/'
const oAuthURL = `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=content_management_manage&action=cli`

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
        copyright
      ].join('\n')
    )

interface Context {
  managementToken?: string
}

interface LoginProps {
  context: Context
  managementToken?: string
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
      console.log(`You're already logged in!`)
      await tokenInfo()
      console.log(
        `To logout, type: ${chalk.green('contentful')} ${chalk.magenta(
          'logout'
        )}\n`
      )
      return managementToken
    }

    console.log(
      `A browser window will open where you will log in (or sign up if you don’t have an account), authorize this CLI tool and paste your ${highlightStyle(
        'CMA token'
      )} here:\n`
    )

    const confirmed = await confirmation('Continue login on the browser?')

    if (!confirmed) {
      console.log(
        chalk.red('Aborted!'),
        'please login to use Contentful CLI features!',
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
      console.log(
        `Unable to open your browser automatically. Please open the following URI in your browser:\n\n${pathStyle(
          oAuthURL
        )}\n\n`
      )
    }

    const tokenAnswer = await inquirer.prompt([
      {
        type: 'password',
        mask: true,
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

  console.log(`\n${chalk.green('Great!')} You've successfully logged in!`)

  await tokenInfo()

  return token
}

export const handler = handle(login)
