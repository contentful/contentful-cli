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
class AbortedError extends Error { }

const guides = {
  'starter-nuxt-blog': {
    name: 'Nuxt Starter Blog',
    directoryName: 'contentful-nuxt-blog',
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
    directoryName: 'contentful-gatsby-blog',
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
    wrappedLog(`${generateNumberEmoji(stepCount)} Sign in to a new or existing account`, GUIDE_MAX_WIDTH)
    log(separator(GUIDE_MAX_WIDTH))
    log()
    wrappedLog(`First, we’ll store your access token (CMA token) on your machine in order for the CLI to authenticate write requests against the ${highlightStyle('Content Management API')}.`, GUIDE_MAX_WIDTH)
    log()
    wrappedLog(`We’ll run the ${codeStyle('contentful login')} command which will open a new browser window. In the browser, you’ll find your ${highlightStyle('CMA token')}. Copy/paste your ${highlightStyle('CMA token')} to authenticate.`, GUIDE_MAX_WIDTH)
    log()

    await login()
  }
}

async function createSpaceStep (guideContext) {
  guideContext.stepCount++

  const { stepCount, activeGuide } = guideContext

  const createSpaceCommand = ['contentful', 'space', 'create', '--name', activeGuide.name]

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Create a Space to hold entries`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  wrappedLog(`${
    stepCount > 1 ? 'Next' : 'First'
  }, we’ll create a Space which is a container for all of your structured content. We’ll create and name the space '${
    highlightStyle(activeGuide.name)
  }' using the command: ${
    codeStyle(shellescape(createSpaceCommand))
  }`,
  GUIDE_MAX_WIDTH
  )

  log()
  const confirmSpaceCreate = await confirmation('Create your new Space now?')

  if (!confirmSpaceCreate) {
    throw new AbortedError()
  }

  const space = await spaceCreate({
    name: activeGuide.name
  })

  guideContext.spaceId = space.sys.id
}

async function seedStep (guideContext) {
  guideContext.stepCount++

  const { stepCount, spaceId, activeGuide } = guideContext

  const seedSpaceCommand = ['contentful', 'space', 'seed', '--template', activeGuide.seed, '--space-id', spaceId]

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Create your Content model and first Entries`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(`Next, we’ll add blog content to your Space. It will be structured as ${highlightStyle('Persons')} and ${highlightStyle('Blog Posts')}.`)
  log()
  wrappedLog(`We'll proceed with the following command ${codeStyle(shellescape(seedSpaceCommand))}.`, GUIDE_MAX_WIDTH)
  log()

  const confirmSpaceSeed = await confirmation('Populate the Content model to your Space now?')
  log()

  if (!confirmSpaceSeed) {
    throw new AbortedError()
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

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Set up a ${activeGuide.name} to display your content`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(`We’ll now download the latest version of the ${activeGuide.name} source to your machine. Just select a directory name, a destination, and we can continue.`)
  log()
  const directoryNameAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'directoryName',
      message: 'The directory should be called:',
      default: activeGuide.directoryName
    }
  ])

  const { directoryName } = directoryNameAnswer

  const directoryPathAnswer = await inquirer.prompt([
    {
      type: 'directory',
      name: 'directoryPath',
      message: `Where should the '${highlightStyle(directoryName)}' directory be located?`,
      basePath: homedir()
    }
  ])

  const { directoryPath } = directoryPathAnswer

  const installationDirectory = join(directoryPath, directoryName)

  const tasks = new Listr([
    {
      title: `Download and extract source code of the ${activeGuide.name}`,
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
      title: 'Creating a Contentful Delivery API token to read content from your Space.',
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
      title: 'Setting up project configuration file which includes your Contentful Delivery API token',
      task: async (ctx) => {
        const { cmaToken } = await getContext()
        const { cdaToken } = ctx
        return activeGuide.setupConfig({ cmaToken, cdaToken, spaceId, installationDirectory })
      }
    }
  ], {
    collapse: false
  })

  log()
  await tasks.run()

  guideContext.installationDirectory = installationDirectory
}

async function devServerStep (guideContext) {
  guideContext.stepCount++
  const { installationDirectory, activeGuide, stepCount } = guideContext
  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(`${generateNumberEmoji(stepCount)} Run the website in development mode on your machine`, GUIDE_MAX_WIDTH)
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(`${highlightStyle('Almost done!')} Your ${activeGuide.name} has been set up on your local machine. It will now be started by running: ${codeStyle(`${activeGuide.devExecutable} ${activeGuide.devParameters.join(' ')}`)}`)
  log()
  wrappedLog(`A browser will open showing your new ${activeGuide.name}. Feel free to make changes to the code and see them appear immediatly.`, GUIDE_MAX_WIDTH)
  log()
  wrappedLog(`You may exit development mode by pressing the Q or CTRL+C`, GUIDE_MAX_WIDTH)

  const confirmDevServer = await confirmation(`Run ${activeGuide.name} locally in development mode now?`)
  log()

  if (!confirmDevServer) {
    throw new AbortedError()
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
  const { installationDirectory, activeGuide } = guideContext

  success(`${successEmoji} ${chalk.bold('Congratulations!')} The guide is now completed.`)
  log()
  log(`You can navigate to your ${activeGuide.name} by running: ${codeStyle(`cd ${relative(process.cwd(), installationDirectory)}`)}`)
  log()
  try {
    const whatsNextText = await readFile(join(installationDirectory, 'WHATS-NEXT.MD'))
    log(frame(markdown(whatsNextText.toString()).trim()))
  } catch (e) {}
}

export async function guide () {
  const guideContext = {
    stepCount: 0,
    activeGuide: guides['starter-gatsby-blog']
  }

  log()
  log(asciiText('Contentful Guide'))

  // Enforce first steps to be executed
  try {
    // Step 1 - Login
    await loginStep(guideContext)

    // Step 2 - Create space
    await createSpaceStep(guideContext)

    // Step 3 - Seed Content
    await seedStep(guideContext)

    // Step 4 - Set up custom app
    await setupStep(guideContext)
  } catch (error) {
    if (error instanceof AbortedError) {
      log('The guide was aborted by the user')
      return
    }
    throw error
  }

  // Dev server step is optional
  try {
    // Step 5 - Run dev server
    await devServerStep(guideContext)
  } catch (error) {
    if (!(error instanceof AbortedError)) {
      throw error
    }
  }

  // Finished
  await finishStep(guideContext)
}

export const handler = handle(guide)
