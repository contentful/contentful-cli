import { join, relative } from 'path'
import { homedir } from 'os'

import inquirer from 'inquirer'
import selectDirectory from 'inquirer-select-directory'
import shellescape from 'shell-escape'
import Listr from 'listr'
import execa from 'execa'
import commandExists from 'command-exists'
import bfj from 'bfj'
import opn from 'opn'
import chalk from 'chalk'
import { readFile } from 'mz/fs'
import markdown from 'markdown-cli'
import treeKill from 'tree-kill'

import { login } from './login'
import { spaceCreate } from './space_cmds/create'
import { spaceSeed } from './space_cmds/seed'
import { accessTokenCreate } from './space_cmds/accesstoken_cmds/create'
import { getContext } from '../context'
import { getLatestGitHubRelease } from '../utils/github'
import { log, wrappedLog, success, logError } from '../utils/log'
import { asciiText, frame, separator } from '../utils/text'
import { highlightStyle, codeStyle } from '../utils/styles'
import { successEmoji, generateNumberEmoji } from '../utils/emojis'
import { handleAsyncError as handle } from '../utils/async'
import { confirmation } from '../utils/actions'

inquirer.registerPrompt('directory', selectDirectory)

const guideOptimalColumns = 120
const GUIDE_MAX_WIDTH = process.stdout.columns < guideOptimalColumns ? process.stdout.columns : guideOptimalColumns
const installationFolderName = 'contentful-custom-app'

const guides = {
  'starter-nuxt-blog': {
    name: 'Nuxt Starter Blog',
    repository: 'contentful/blog-in-5-minutes',
    seed: 'blog',
    setupConfig: async ({cmaToken, cdaToken, spaceId, installationDirectory}) => {
      const config = await bfj.read(join(installationDirectory, '.contentful.sample.json'))
      config.CTF_CDA_ACCESS_TOKEN = cdaToken
      config.CTF_CMA_ACCESS_TOKEN = cmaToken
      config.CTF_SPACE_ID = spaceId
      return bfj.write(join(installationDirectory, '.contentful.json'), config, {
        space: 2
      })
    },
    devExecutable: 'npm',
    devParameters: ['run', 'dev'],
    devURI: 'http://127.0.0.1:3000',
    devBrowserOpenRegex: /DONE/
  },
  'starter-gatsby-blog': {
    name: 'Gatsby Starter Blog',
    repository: 'contentful/starter-gatsby-blog',
    seed: 'blog',
    setupConfig: async ({cdaToken, spaceId, installationDirectory}) => {
      const config = await bfj.read(join(installationDirectory, '.contentful.json.sample'))
      config.spaceId = spaceId
      config.accessToken = cdaToken
      return bfj.write(join(installationDirectory, '.contentful.json'), config, {
        space: 2
      })
    },
    devExecutable: 'npm',
    devParameters: ['run', 'dev'],
    devURI: 'http://127.0.0.1:8000',
    devBrowserOpenRegex: /You can now view .* in the browser./
  }
}

export const command = 'guide'

export const desc = 'A guide introducing basic concepts of working with Contentful'

async function loginStep (guideContext) {
  const { cmaToken } = await getContext()

  if (!cmaToken) {
    guideContext.stepCount++

    const {stepCount} = guideContext

    log(separator(GUIDE_MAX_WIDTH))
    wrappedLog(`${generateNumberEmoji(stepCount)} Sign in to new or existing account`, GUIDE_MAX_WIDTH)
    log(separator(GUIDE_MAX_WIDTH))
    log()
    wrappedLog(`First let's store your ${highlightStyle('Content Management API')} access token (CMA token). A new browser window will open, where you will find your ${highlightStyle('CMA token')}. Let's proceed with the following command: ${codeStyle('contentful login')}.`, GUIDE_MAX_WIDTH)
    log()

    await login()
  }
}

async function createSpaceStep (guideContext) {
  guideContext.stepCount++

  const { stepCount, activeGuide } = guideContext

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Create a Space to hold entries`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  wrappedLog(`${stepCount > 1 ? 'Second' : 'First'} let's create a Space, which is a container for all of your structure and content.`, GUIDE_MAX_WIDTH)
  log()

  const spaceNameAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Which name for the Space would you prefer?',
      default: activeGuide.name,
      validate: (val) => val.trim().length ? true : 'Please provide a name'
    }
  ])

  const createSpaceCommand = ['contentful', 'space', 'create', '--name', spaceNameAnswer.name]

  // Make this one line again
  log()
  wrappedLog(`Let's proceed with the following command ${codeStyle(shellescape(createSpaceCommand))}.`, GUIDE_MAX_WIDTH)
  log()

  const confirmSpaceCreate = await confirmation('Create your new Space now?')
  log()

  if (!confirmSpaceCreate) {
    log('Guide aborted by the user.')
    return
  }

  const space = await spaceCreate({
    name: spaceNameAnswer.name
  })

  guideContext.spaceId = space.sys.id
}

async function seedStep (guideContext) {
  guideContext.stepCount++

  const { stepCount, spaceId, activeGuide } = guideContext

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Create first Content model and Entries`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(`You will now add your first content. It will be structured as ${highlightStyle('Persons')} and ${highlightStyle('Blog Posts')}.`)
  log()
  const seedSpaceCommand = ['contentful', 'space', 'seed', '--template', activeGuide.seed, '--space-id', spaceId]
  wrappedLog(`Let's proceed with the following command ${codeStyle(shellescape(seedSpaceCommand))}.`, GUIDE_MAX_WIDTH)
  log()

  const confirmSpaceSeed = await confirmation('Populate the Content model to your Space now?')
  log()

  if (!confirmSpaceSeed) {
    log('Guide aborted by the user.')
    return
  }

  await spaceSeed({
    template: activeGuide.seed,
    spaceId,
    yes: true
  })
}

async function setupStep (guideContext) {
  guideContext.stepCount++

  const { stepCount, spaceId, activeGuide } = guideContext
  let { installationDirectory } = guideContext

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Set up and deploy a Custom app to display your content`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log('Currently, only the JavaScript custom app is provided. Custom apps for the remaining languages will be provided soon.')
  log()
  log(`The source code of the Custom app will be stored at:`)
  log(highlightStyle(installationDirectory))
  log()
  const changeFolderAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'changeFolder',
      message: 'Is the path above okay?',
      choices: [
        {
          name: `Yes, add it to my home directory (${homedir()})`,
          value: false
        },
        {
          name: 'No, I want to choose the location on my own',
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

    installationDirectory = join(directoryAnswer.directory, 'contentful-custom-app')
  }

  const tasks = new Listr([
    {
      title: 'Download and extract source code of the Contentful Custom app',
      task: () => {
        return getLatestGitHubRelease(activeGuide.repository, installationDirectory)
      }
    },
    {
      title: 'Installing dependencies',
      task: () => {
        return new Listr([
          {
            title: 'Test if yarn is available',
            task: async (ctx) => {
              try {
                await commandExists('yarn')
                ctx.hasYarn = true
              } catch (err) {
                ctx.hasYarn = false
              }
            }
          },
          {
            title: 'Install via yarn - this may take up to one minute',
            task: () => {
              return execa('yarn', [], {
                cwd: installationDirectory
              })
            },
            enabled: (ctx) => ctx.hasYarn
          },
          {
            title: 'Install via npm - this may take up to one minute',
            task: () => {
              return execa('npm', ['install'], {
                cwd: installationDirectory
              })
            },
            enabled: (ctx) => !ctx.hasYarn
          }
        ])
      }
    },
    {
      title: 'Generating custom delivery access token with the name \'Contentful Get Started Guide\'',
      task: async (ctx) => {
        const { accessToken } = await accessTokenCreate({
          name: 'Contentful Get Started Guide',
          description: 'This access token was created by the Contentful Get Started Guide',
          silent: true,
          spaceId
        })
        ctx.cdaToken = accessToken
      }
    },
    {
      title: 'Setting up project configuration file',
      task: async (ctx) => {
        const { cmaToken } = await getContext()
        const { cdaToken } = ctx
        return activeGuide.setupConfig({ cmaToken, cdaToken, spaceId, installationDirectory })
      }
    }
  ])

  log()
  await tasks.run()

  guideContext.installationDirectory = installationDirectory
}

async function devServerStep (guideContext) {
  const { installationDirectory, activeGuide } = guideContext
  log()
  log(`${highlightStyle('Almost done!')} Your Custom app has been set up on your local machine. It will now be started by running: ${codeStyle(`${activeGuide.devExecutable} ${activeGuide.devParameters.join(' ')}`)}`)
  log()
  wrappedLog('A browser will open showing your new Custom app and the Contentful web app where you can manage your content. Feel free to make changes and reload your Custom app to see them after a few seconds.', GUIDE_MAX_WIDTH)
  log()

  const confirmDevServer = await confirmation('Run Custom app locally in development mode now?')
  log()

  if (!confirmDevServer) {
    log('Guide aborted by the user.')
    return
  }

  const task = execa(activeGuide.devExecutable, activeGuide.devParameters, {
    cwd: installationDirectory
  })
  let errorThrown = true

  task.stdout.pipe(process.stdout)

  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  process.stdin.setRawMode(true)

  const killer = (key) => {
    if (['\u0003', 'q', 'Q'].includes(key)) {
      errorThrown = false
      treeKill(task.pid)
    }
  }

  process.stdin.on('data', killer)

  try {
    // Open dev server as soon the first build finished
    const opener = (data) => {
      const str = data.toString()
      if (activeGuide.devBrowserOpenRegex.test(str)) {
        opn(activeGuide.devURI, {
          wait: false
        })
        task.stdout.removeListener('data', opener)
      }
    }
    task.stdout.on('data', opener)
    await task
  } catch (err) {
    // Log error only when process got not killed by user
    if (errorThrown) {
      logError(err)
    }
  } finally {
    process.stdin.removeListener('data', killer)
    process.stdin.setRawMode(false)
    process.stdin.pause()
  }
}

async function finishStep (guideContext) {
  const {installationDirectory} = guideContext

  const whatsNextText = await readFile(join(installationDirectory, 'WHATS-NEXT.MD'))

  success(`${successEmoji} ${chalk.bold('Congratulations!')} The guide is now completed.`)
  log()
  log(`You can navigate to your Custom app by running: ${codeStyle(`cd ${relative(process.cwd(), installationDirectory)}`)}`)
  log()
  log(frame(markdown(whatsNextText.toString()).trim()))
}

export async function guide () {
  const installationDirectory = join(homedir(), installationFolderName)

  const guideContext = {
    installationDirectory,
    stepCount: 0,
    activeGuide: guides['starter-gatsby-blog']
  }

  log()
  log(asciiText('Contentful Guide'))

  // Step 1 - Login
  await loginStep(guideContext)

  // Step 2 - Create space
  await createSpaceStep(guideContext)

  // Step 3 - Seed Content
  await seedStep(guideContext)

  // Step 4 - Set up custom app
  await setupStep(guideContext)

  // Step 5 - Run dev server
  await devServerStep(guideContext)

  // Finished
  await finishStep(guideContext)
}

export const handler = handle(guide)
