import inquirer from 'inquirer'
import shellescape from 'shell-escape'
import Table from 'cli-table2'

import { login } from './login'
import { spaceCreate } from './space_cmds/create'
import { spaceSeed } from './space_cmds/seed'
import { downloadBoilerplate } from './boilerplate'
import { getContext } from '../context'
import { log, wrappedLog, success } from '../utils/log'
import { asciiText, separator } from '../utils/text'
import { highlightStyle, codeStyle } from '../utils/styles'
import { successEmoji, generateNumberEmoji } from '../utils/emojis'
import { handleAsyncError as handle } from '../utils/async'

const guideOptimalColumns = 120
const GUIDE_MAX_WIDTH = process.stdout.columns < guideOptimalColumns ? process.stdout.columns : guideOptimalColumns

export const command = 'guide'

export const desc = 'A guide introducing basic concepts of working with Contentful'

export async function guide () {
  const { cmaToken } = await getContext()

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

  let spaceId = null
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
  spaceId = space.sys.id

  // Step 3 - Seed Content
  log()
  log(separator(GUIDE_MAX_WIDTH))
  stepCount = stepCount + 1
  wrappedLog(`${generateNumberEmoji(stepCount)} Create first Content model and Entries`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  wrappedLog(`You will now add your first few Entries, based on the Content model below:`, GUIDE_MAX_WIDTH)
  log()

  // Consider moving this to the seed command
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

  // Step 4 - Download boilerplates
  log()
  log(separator(GUIDE_MAX_WIDTH))
  stepCount = stepCount + 1
  wrappedLog(`${generateNumberEmoji(stepCount)} Download a boilerplate app to display your content`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  const boilerplateCommand = ['contentful', 'boilerplate', '--spaceId', spaceId]
  wrappedLog(`Let's proceed with the following command ${codeStyle(shellescape(boilerplateCommand))}.`, GUIDE_MAX_WIDTH)
  log()

  await downloadBoilerplate({
    spaceId
  })

  // Finished
  log()
  wrappedLog(`Your current working directory was changed to the download location of the bolerplate. Follow the instructions above to install and run your boilerplate.`, GUIDE_MAX_WIDTH)
  log()
  success(`${successEmoji} Congratulations! You finished the ${highlightStyle('Get started guide')}.`)
}

export const handler = handle(guide)
