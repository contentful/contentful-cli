import { join, relative } from 'path'
import { homedir } from 'os'

import inquirer from 'inquirer'
import selectDirectory from 'inquirer-select-directory'
import shellescape from 'shell-escape'
import Table from 'cli-table2'
import Listr from 'listr'
import execa from 'execa'
import commandExists from 'command-exists'
import { createClient } from 'contentful-management'
import { writeFile } from 'mz/fs'

import { login } from './login'
import { spaceCreate } from './space_cmds/create'
import { spaceSeed } from './space_cmds/seed'
import { getContext } from '../context'
import getLatestGitHubRelease from '../utils/getLatestGitHubRelease'
import { log, wrappedLog, success } from '../utils/log'
import { asciiText, frame, separator } from '../utils/text'
import { highlightStyle, codeStyle } from '../utils/styles'
import { successEmoji, generateNumberEmoji } from '../utils/emojis'
import { handleAsyncError as handle } from '../utils/async'

inquirer.registerPrompt('directory', selectDirectory)

const guideOptimalColumns = 120
const GUIDE_MAX_WIDTH = process.stdout.columns < guideOptimalColumns ? process.stdout.columns : guideOptimalColumns
const installationFolderName = 'contentful-example-blog'

export const command = 'guide'

export const desc = 'A guide introducing basic concepts of working with Contentful'

export async function guide () {
  const { cmaToken } = await getContext()
  let installationDirectory = join(homedir(), installationFolderName)
  let stepCount = 0
  log()
  log(asciiText('Contentful Guide'))

  // Step 1 - Login
  if (!cmaToken) {
    log(separator(GUIDE_MAX_WIDTH))
    stepCount = stepCount + 1
    wrappedLog(`${generateNumberEmoji(stepCount)} Sign in to new or existing account`, GUIDE_MAX_WIDTH)
    log(separator(GUIDE_MAX_WIDTH))
    log()
    wrappedLog(`First let's store your ${highlightStyle('Content Management API')} access token (CMA token). A new browser window will open, where you will find your ${highlightStyle('CMA token')}. Let's proceed with the following command: ${codeStyle('contentful login')}.`, GUIDE_MAX_WIDTH)
    log()

    await login()
  }

  // Step 2 - Create space
  log()
  log(separator(GUIDE_MAX_WIDTH))
  stepCount = stepCount + 1
  wrappedLog(`${generateNumberEmoji(stepCount)} Create a Space to hold entries`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  wrappedLog(`${stepCount > 1 ? 'Secondly' : 'First'} let's create a Space, which is a container for all of your structure and content.`, GUIDE_MAX_WIDTH)
  log()

  let spaceNameAnswer = {
    name: 'Blog'
  }
  const acceptSpaceNameAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'accept',
      message: `Your Space will be called ${highlightStyle(spaceNameAnswer.name)}. Are you fine with that?`
    }
  ])
  if (!acceptSpaceNameAnswer.accept) {
    spaceNameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Which name for the Space would you prefer?',
        default: 'Blog',
        validate: (val) => val.trim().length ? true : 'Please provide a name'
      }
    ])
  }

  const createSpaceCommand = ['contentful', 'space', 'create', '--name', spaceNameAnswer.name]

  // Make this one line again
  log()
  wrappedLog(`Let's proceed with the following command ${codeStyle(shellescape(createSpaceCommand))}.`, GUIDE_MAX_WIDTH)
  log()

  const space = await spaceCreate({
    name: spaceNameAnswer.name
  })
  const spaceId = space.sys.id

  // Step 3 - Seed Content
  log()
  log(separator(GUIDE_MAX_WIDTH))
  stepCount = stepCount + 1
  wrappedLog(`${generateNumberEmoji(stepCount)} Create first Content model and Entries`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  wrappedLog(`You will now add your first few Entries, based on the Content model below:`, GUIDE_MAX_WIDTH)
  log()

  // @todo move this table to seed command and autogenerate it
  const table = new Table({
    head: ['Post', 'Author', 'Category']
  })
  table.push(['Title', 'Name', 'Title'])
  table.push(['Slug', 'Website', 'Short description'])
  table.push(['Author', 'Profile Photo', 'Icon'])
  table.push(['Body', 'Biography', ''])
  table.push(['Category', 'Created Entries', ''])
  table.push(['Tags', '', ''])
  table.push(['Featured image', '', ''])
  table.push(['Date', '', ''])
  table.push(['Comments', '', ''])

  log(table.toString())
  log()
  const seedSpaceCommand = ['contentful', 'space', 'seed', '--template', 'blog', '--spaceId', spaceId]
  wrappedLog(`Let's proceed with the following command ${codeStyle(shellescape(seedSpaceCommand))}.`, GUIDE_MAX_WIDTH)
  log()

  await spaceSeed({
    template: 'blog',
    spaceId
  })

  // Step 4 - Set up blog app
  log()
  log(separator(GUIDE_MAX_WIDTH))
  stepCount = stepCount + 1
  wrappedLog(`${generateNumberEmoji(stepCount)} Set up and deploy a blog app to display your content`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(`We will now create an empty folder your home directory to install the example blog app into:`)
  log(highlightStyle(installationDirectory))
  log()
  const changeFolderAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'changeFolder',
      message: 'Are you find with creating that folder in your home directory?',
      choices: [
        {
          name: 'Yes, got for it.',
          value: false
        },
        {
          name: 'No, I want to choose a folder to install the app to',
          value: true
        }
      ]
    }
  ])
  if (changeFolderAnswer.changeFolder) {
    const directoryAnswer = await inquirer.prompt([
      {
        type: 'directory',
        name: 'directory',
        message: `Where should the '${highlightStyle(installationFolderName)}' folder be located?`,
        basePath: homedir()
      }
    ])

    installationDirectory = join(directoryAnswer.directory, 'contentful-example-blog')
  }

  const tasks = new Listr([
    {
      title: 'Download and extract source code of contentful-example-blog',
      task: () => {
        return getLatestGitHubRelease('contentful/blog-in-5-minutes', installationDirectory)
      }
    },
    {
      title: 'Installing dependencies',
      task: () => {
        return commandExists('yarn')
        .then(() => {
          return execa('yarn', [], {
            cwd: installationDirectory
          })
        })
        .catch(() => {
          return execa('npm', ['install'], {
            cwd: installationDirectory
          })
        })
      }
    },
    {
      title: 'Generating custom CDA access token',
      task: async (ctx) => {
        // @todo move this to a separate command
        const { cmaToken } = await getContext()

        const client = createClient({
          accessToken: cmaToken
        })
        const space = await client.getSpace(spaceId)
        const tokenName = 'Example Blog'
        const cdaTokens = await space.getApiKeys()

        let apiKey = cdaTokens.items.find((token) => token.name === tokenName)

        if (!apiKey) {
          apiKey = await space.createApiKey({
            name: tokenName
          })
          log(`A new API key called '${tokenName}' was created for the Space ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}).`)
          log()
        }

        ctx.cdaToken = apiKey.accessToken
      }
    },
    {
      title: 'Setting up project configuration file',
      task: async (ctx) => {
        const { cmaToken } = await getContext()
        const config = require(join(installationDirectory, '.contentful.sample'))
        config.CTF_CDA_ACCESS_TOKEN = ctx.cdaToken
        config.CTF_CMA_ACCESS_TOKEN = cmaToken
        config.CTF_SPACE_ID = spaceId
        ctx.config = config
        return writeFile(join(installationDirectory, '.contentful.js'), `module.exports = ${JSON.stringify(config, null, 2)}\n`)
      }
    }
  ])

  await tasks.run()

  // Finished
  log()
  success(`${successEmoji} Congratulations! Your example blog app was set up successfully.`)
  log()
  const indent = (str) => `\n${str}`.replace(/\s*[\n\r]\s*/g, '\n    ')
  const message = [
    highlightStyle('What you should do next:'),
    '',
    indent('Switch to the project directory'),
    indent(frame(`$ cd ${relative(process.cwd(), installationDirectory)}`, true)),
    '',
    'Start the blog on your local machine to get a first look - takes 1 minute',
    '',
    indent('To boot a local development server, just run the following command:'),
    indent(frame('$ npm run dev', true)),
    '',
    'Deploy the server right away to now.sh - takes 5 minutes',
    '',
    indent('To boot a local development server, just run the following command:'),
    indent(frame('$ npm run deploy', true))
  ]

  log(message.join('\n'))
}

export const handler = handle(guide)
