import { createClient } from 'contentful-management'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import axios from 'axios'
import markdown from 'markdown-cli'

import { getContext } from '../context'
import { handleAsyncError as handle } from '../utils/async'
import { log, info, success } from '../utils/log'
import { successEmoji } from '../utils/emojis'
import { highlightStyle } from '../utils/styles'
import { frame } from '../utils/text'

import { checkLoggedIn, checkSpaceIdProvided } from '../utils/validators'

export const command = 'boilerplate'

export const desc = 'Download a boilerplate'

export const builder = (yargs) => {
  return yargs
    .example('contentful boilerplate')
    .option('spaceId', {
      alias: 's',
      describe: 'ID of the Space the boilerplate will be connecting to'
    })
    .epilog('See more at:\nhttps://github.com/contentful/contentful-cli/tree/master/docs/boilerplate')
}

export async function downloadBoilerplate (argv) {
  await checkLoggedIn()
  await checkSpaceIdProvided(argv)

  const context = await getContext()
  const { cmaToken, activeSpaceId } = context

  // @todo - this should be a generic function
  const spaceId = argv.spaceId || activeSpaceId

  const client = createClient({
    accessToken: cmaToken
  })
  const space = await client.getSpace(spaceId)
  const keyName = 'Boilerplate CDA key'
  const apiKeys = await space.getApiKeys()

  let apiKey = apiKeys.items.find((key) => key.name === keyName)

  if (!apiKey) {
    apiKey = await space.createApiKey({
      name: keyName
    })
    log()
    info(`A new API key called '${keyName}' was created for the Space ${highlightStyle(space.name)} (${highlightStyle(space.sys.id)}).`)
    log()
  }

  const boilerplatesResult = await axios({
    url: 'https://tools.contentful.com/boilerplates'
  })
  .then((response) => {
    return response.data
  })
  .catch((err) => {
    throw err
  })

  const boilerplates = boilerplatesResult.items

  const languages = {
    android: 'Android',
    java: 'Java',
    javascript: 'JavaScript',
    net: '.NET',
    objc: 'Objective-C',
    php: 'PHP',
    python: 'Python',
    ruby: 'Ruby',
    swift: 'Swift'
  }

  const boilerplateChoices = boilerplates.map((boilerplate) => ({
    name: `[${languages[boilerplate.sys.id]}] ${boilerplate.name}`,
    value: boilerplate.sys.id
  }))

  const selectionAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'boilerplate',
      message: 'Which boilerplate would you like to download?',
      choices: boilerplateChoices
    }
  ])

  const boilerplate = boilerplates.find((boilerplate) => boilerplate.sys.id === selectionAnswers.boilerplate)
  const filePath = resolve('.', `boilerplate-${boilerplate.sys.id}.zip`)
  log()
  const spinner = ora({
    text: `Downloading ${boilerplate.name} boilerplate`,
    spinner: 'pong'
  }).start()

  try {
    const response = await axios({
      url: `https://tools.contentful.com/boilerplates/${boilerplate.sys.id}/download?space_id=${spaceId}&access_token=${apiKey.accessToken}`,
      responseType: 'stream'
    })

    const writeFilePromise = new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath)
      .on('error', reject)
      .on('finish', resolve)

      response.data.pipe(writeStream)
    })

    await writeFilePromise

    spinner.succeed()

    log()
    success(`${successEmoji} Finished downloading the ${boilerplate.name} boilerplate to:`)
    info(filePath)
    log()
    const instructions = []
    instructions.push(chalk.bold(boilerplate.name))
    instructions.push('')
    if (boilerplate.description) {
      instructions.push(markdown(boilerplate.description).trim())
    }
    if (boilerplate.instructions) {
      instructions.push('\n')
      instructions.push(chalk.bold('Installation instructions:'))
      instructions.push('')
      instructions.push(markdown(boilerplate.instructions).trim())
    }
    log(frame(instructions.join('\n')))
  } catch (error) {
    spinner.fail(error.message)
    throw error
  }
}

export const handler = handle(downloadBoilerplate)
