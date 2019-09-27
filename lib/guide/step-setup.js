const { join } = require('path')
const { homedir } = require('os')

const inquirer = require('inquirer')
const Listr = require('listr')
const execa = require('execa')

const {
  accessTokenCreate
} = require('../cmds/space_cmds/accesstoken_cmds/create')
const { getContext } = require('../context')
const { getLatestGitHubRelease } = require('../utils/github')
const { log, wrappedLog } = require('../utils/log')
const { separator } = require('../utils/text')
const { highlightStyle } = require('../utils/styles')
const { generateNumberEmoji } = require('../utils/emojis')

const { GUIDE_MAX_WIDTH } = require('./helpers')

module.exports = async function setupStep(guideContext) {
  guideContext.stepCount++

  const { stepCount, spaceId, activeGuide } = guideContext

  log()
  log(separator(GUIDE_MAX_WIDTH))
  wrappedLog(
    `${generateNumberEmoji(stepCount)} Set up a ${
      activeGuide.name
    } to display your content`,
    GUIDE_MAX_WIDTH
  )
  log(separator(GUIDE_MAX_WIDTH))
  log()
  log(
    `We’ll now download the latest version of the ${activeGuide.name} source to your machine. Just select a directory name, a destination, and we can continue.`
  )
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
      message: `Where should the '${highlightStyle(
        directoryName
      )}' directory be located?`,
      basePath: homedir()
    }
  ])

  const { directoryPath } = directoryPathAnswer

  const installationDirectory = join(directoryPath, directoryName)

  const tasks = new Listr(
    [
      {
        title: `Download and extract source code of the ${activeGuide.name}`,
        task: () => {
          return getLatestGitHubRelease(
            activeGuide.repository,
            installationDirectory
          )
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
        title:
          'Creating a Contentful Delivery API token to read content from your Space.',
        task: async ctx => {
          const context = await getContext()
          const { accessToken } = await accessTokenCreate({
            name: 'Contentful Get Started Guide',
            description:
              'This access token was created by the Contentful Get Started Guide',
            silent: true,
            feature: 'guide',
            context: { activeSpaceId: spaceId, ...context }
          })
          ctx.deliveryToken = accessToken
        }
      },
      {
        title:
          'Setting up project configuration file which includes your Contentful Delivery API token',
        task: async ctx => {
          const { managementToken } = await getContext()
          const { deliveryToken } = ctx
          return activeGuide.setupConfig({
            managementToken,
            deliveryToken,
            spaceId,
            installationDirectory
          })
        }
      }
    ],
    {
      collapse: false
    }
  )

  log()
  await tasks.run()

  guideContext.installationDirectory = installationDirectory
}
