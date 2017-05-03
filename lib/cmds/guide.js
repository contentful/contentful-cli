import inquirer from 'inquirer'
import shellescape from 'shell-escape'
import Table from 'cli-table2'

import { handler as loginHandler } from './login'
import { handler as spaceCreateHandler } from './space_cmds/create'
import { handler as spaceUseHandler } from './space_cmds/use'
import { handler as seedHandler } from './space_cmds/seed'
import { handler as boilerplateHandler } from './boilerplate'
import { getContext } from '../context'
import { log, wrappedLog, success } from '../utils/log'
import { frame, asciiText, separator } from '../utils/text'
import { highlightStyle, codeStyle } from '../utils/styles'
import { successEmoji, generateNumberEmoji } from '../utils/emojis'
import { handleAsyncError as handle } from '../utils/async'

const guideOptimalColumns = 90
const GUIDE_MAX_WIDTH = process.stdout.columns < guideOptimalColumns ? process.stdout.columns : guideOptimalColumns

export const command = 'guide'

export const desc = 'A guide introducing basic concepts of working with Contentful'

export async function guide () {
  let stepCount = 0
  let context = await getContext()
  log()
  log(asciiText('Contentful Guide'))

  // Step 1 - Login
  if (!context.cmaToken) {
    log(separator())
    stepCount = stepCount + 1
    wrappedLog(`${generateNumberEmoji(stepCount)} Sign in to new or existing account`, GUIDE_MAX_WIDTH)
    log(separator())
    log()
    wrappedLog(`First let's store your ${highlightStyle('Content Management API')} access token (CMA token). A new browser window will open, where you will find your ${highlightStyle('CMA token')}. Let's proceed with the following command:`, GUIDE_MAX_WIDTH)
    log()
    log(frame(codeStyle('$ contentful login'), true))
    log()

    await loginHandler()
    context = await getContext()
  }

  // Step 2 - Create space
  log()
  log(separator())
  stepCount = stepCount + 1
  wrappedLog(`${generateNumberEmoji(stepCount)} Create a Space to hold entries`, GUIDE_MAX_WIDTH)
  log(separator())
  log()
  wrappedLog(`${stepCount > 1 ? 'Secondly' : 'First'} let's create a Space, which is a container for all of your structure and content.`, GUIDE_MAX_WIDTH)
  log()

  let spaceId = null
  while (!spaceId) {
    const spaceActionAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'You can either create a new Space or use an existing one:',
        choices: [
          {
            name: 'Create a new space',
            value: 'new'
          },
          {
            name: 'Use an existing space (Temporary implemented till organizations endpoint is public)',
            value: 'existing'
          }
        ]
      }
    ])

    if (spaceActionAnswer.action === 'new') {
      const spaceNameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'The name of your new Space:'
        }
      ])

      const createSpaceCommand = ['contentful', 'space', 'create', '--name', spaceNameAnswer.name]

      log()
      wrappedLog(`Let's proceed with the following command:`, GUIDE_MAX_WIDTH)
      log()
      log(frame(codeStyle('$ ' + shellescape(createSpaceCommand)), true))
      log()

      try {
        const space = await spaceCreateHandler({
          name: spaceActionAnswer.name
        })
        spaceId = space.sys.id
      } catch (err) {
        // Error already displayed to user
      }
    }

    // Hint: Using existing spaces is only implemented for the internal alpha phase
    if (spaceActionAnswer.action === 'existing') {
      log()
      wrappedLog(`Let's proceed with the following command:`, GUIDE_MAX_WIDTH)
      log()
      log(frame(codeStyle('$ contentful space use'), true))
      log()
      const space = await spaceUseHandler()
      spaceId = space.sys.id
    }
  }

  // Step 3 - Seed Content
  log()
  log(separator())
  stepCount = stepCount + 1
  wrappedLog(`${generateNumberEmoji(stepCount)} Create first Content model and Entries`, GUIDE_MAX_WIDTH)
  log(separator())
  log()
  wrappedLog(`You will now add your first few Entries, based on the Content model below:`, GUIDE_MAX_WIDTH)
  log()

  const table = new Table({
    head: ['Post', 'Author', 'Category']
  })
  table.push(['id', 'id', 'id'])
  table.push(['title', 'name', 'name'])
  table.push(['description', 'description', ''])
  table.push(['author', '', ''])
  table.push(['category', '', ''])
  log(table.toString())
  log()
  wrappedLog(`Let's proceed with the following command:`, GUIDE_MAX_WIDTH)
  log()
  const seedSpaceCommand = ['contentful', 'space', 'seed', '--template', 'blog', '--spaceId', spaceId]
  log(frame(codeStyle('$ ' + shellescape(seedSpaceCommand)), true))
  log()

  await seedHandler({
    template: 'blog',
    spaceId
  })
  log()
  wrappedLog(`Congratulations! Your Space, Content model and Entries have successfully been created.`, GUIDE_MAX_WIDTH)
  log()

  // Step 4 - Download boilerplates
  log()
  log(separator())
  stepCount = stepCount + 1
  wrappedLog(`${generateNumberEmoji(stepCount)} Download Boilerplate`, GUIDE_MAX_WIDTH)
  log(separator())
  log()
  wrappedLog(`This can be done with the following command:`, GUIDE_MAX_WIDTH)
  log()
  const boilerplateCommand = ['contentful', 'boilerplate', '--spaceId', spaceId]
  log(frame(codeStyle('$ ' + shellescape(boilerplateCommand)), true))
  log()

  await boilerplateHandler({
    spaceId
  })

  // Finished
  log()
  log()
  success(`${successEmoji} Congratulations! You are ready to go and continue with the boilerplate.`)
}

export const handler = handle(guide)
