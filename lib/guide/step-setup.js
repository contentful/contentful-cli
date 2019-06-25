import { join } from 'path'
import { homedir } from 'os'

import inquirer from 'inquirer'
import Listr from 'listr'
import execa from 'execa'

import { accessTokenCreate } from '../cmds/space_cmds/accesstoken_cmds/create'
import { getContext } from '../context'
import { getLatestGitHubRelease } from '../utils/github'
import { log, wrappedLog } from '../utils/log'
import { separator } from '../utils/text'
import { highlightStyle } from '../utils/styles'
import { generateNumberEmoji } from '../utils/emojis'

import { GUIDE_MAX_WIDTH } from './helpers'

export default async function setupStep (guideContext) {
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
      title: 'Installing dependencies - this may take up to one minute',
      task: () => {
        return execa('npm', ['install'], {
          cwd: installationDirectory
        })
      }
    },
    {
      title: 'Creating a Contentful Delivery API token to read content from your Space.',
      task: async (ctx) => {
        const context = await getContext()
        const { accessToken } = await accessTokenCreate({
          name: 'Contentful Get Started Guide',
          description: 'This access token was created by the Contentful Get Started Guide',
          silent: true,
          feature: 'guide',
          context: { activeSpaceId: spaceId, ...context }
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
