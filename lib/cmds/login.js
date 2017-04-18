import opn from 'opn'
import inquirer from 'inquirer'
import { getContext, getConfigPath, setContext, storeContext } from '../context'
import { logWithFrame } from '../helpers'

const APP_ID = '4cc8a42980af996977f7ec1d12b8ad4282c219e4913345c8313d145f53387278'
const REDIRECT_URI = 'https://contentful.github.io/contentful-cli-oauth-page/'
const oAuthURL = `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=content_management_manage`

export const command = 'login'

export const desc = 'Login to Contentful'

export const handler = async function login () {
  const context = await getContext()

  if (context.cmaToken) {
    console.log('Looks like you already stored a CMA token in your .contentfulrc file:')
    logWithFrame(`Your CMA token: ${context.cmaToken}`)
    console.log(`Maybe you want to 'contentful logout'?`)
    return
  }

  console.log('A browser window will open now. Please log in over there, authorize the CLI application and paste your CMA token here:')

  await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ready',
      message: 'Are you ready?',
      default: true
    }
  ])

  await opn(oAuthURL, {
    wait: false
  })

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'cmaToken',
      message: 'Paste your token here:',
      validate: (val) => /^[a-f0-9]{64}$/.test(val.trim())
    }
  ])

  console.log(`Great! I have just stored your CMA token on your local machine so you can skip logging in the next time. (File is located at ${getConfigPath()})`)
  await setContext({
    cmaToken: answers.cmaToken
  })
  await storeContext()
  console.log('Done! Yay!')
}
