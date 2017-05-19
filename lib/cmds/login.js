import opn from 'opn'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { getContext, getConfigPath, setContext, storeRuntimeConfig } from '../context'
import { reoccurringConfirmation } from '../utils/actions'
import { handleAsyncError as handle } from '../utils/async'
import { log } from '../utils/log'
import { highlightStyle, codeStyle } from '../utils/styles'
import { frame } from '../utils/text'

const APP_ID = '9f86a1d54f3d6f85c159468f5919d6e5d27716b3ed68fd01bd534e3dea2df864'
const REDIRECT_URI = 'https://www.contentful.com/developers/cli-oauth-page/'
const oAuthURL = `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=content_management_manage`

export const command = 'login'

export const desc = 'Login to Contentful'

export async function login () {
  const { cmaToken } = await getContext()

  if (cmaToken) {
    log()
    log(`Looks like you already stored a CMA token on your system. ${chalk.dim(`(Located at ${getConfigPath()})`)}`)
    log(frame(`Your CMA token: ${cmaToken}`))
    log(`Maybe you want to ${codeStyle('contentful logout')}?`)
    return cmaToken
  }

  log(`A browser window will open where you will log in (or sign up if you don’t have an account), authorize this CLI tool and paste your ${highlightStyle('CMA token')} here:`)
  log()

  await reoccurringConfirmation('Open a browser window now?')

  await opn(oAuthURL, {
    wait: false
  })

  const tokenAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'cmaToken',
      message: 'Paste your token here:',
      validate: (val) => /^[a-f0-9]{64}$/.test(val.trim())
    }
  ])

  await setContext({
    cmaToken: tokenAnswer.cmaToken
  })
  await storeRuntimeConfig()
  log()
  log(`Great! Your ${highlightStyle('CMA token')} is now stored on your system. ${chalk.dim(`(Located at ${getConfigPath()})`)}`)
  log(`You can always run ${codeStyle('contentful logout')} to remove it.`)

  return tokenAnswer.cmaToken
}

export const handler = handle(login)
