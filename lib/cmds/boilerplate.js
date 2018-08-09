import { createWriteStream } from 'fs'
import { resolve } from 'path'

import inquirer from 'inquirer'
import chalk from 'chalk'
import Listr from 'listr'
import axios from 'axios'
import markdown from 'markdown-cli'

import { handleAsyncError as handle } from '../utils/async'
import { log, success } from '../utils/log'
import normalizer from '../utils/normalizer'
import { successEmoji } from '../utils/emojis'
import { frame } from '../utils/text'
import { accessTokenCreate } from './space_cmds/accesstoken_cmds/create'

import { assertLoggedIn, assertSpaceIdProvided } from '../utils/assertions'

export const command = 'boilerplate'

export const desc = 'Download a boilerplate'
const epilog = [
  'See more at:\nhttps://github.com/contentful/contentful-cli/tree/master/docs/boilerplate',
  'Copyright 2018 Contentful, this is a BETA release'
].join('\n')

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful boilerplate')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the Space the boilerplate will be connecting to'
    })
    .epilog(epilog)
}

async function getBoilerplates () {
  try {
    const boilerplatesResult = await axios({
      url: 'https://tools.contentful.com/boilerplates'
    })
    return boilerplatesResult.data
  } catch (err) {
    throw err
  }
}

export async function downloadBoilerplate (argv) {
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)
  const { spaceId } = await normalizer(argv)

  const boilerplatesResult = await getBoilerplates()

  const boilerplates = boilerplatesResult.items

  const boilerplateChoices = boilerplates.map((boilerplate) => ({
    name: boilerplate.name,
    value: boilerplate.sys.id
  }))

  const selectionAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'boilerplate',
      message: 'Which boilerplate would you like to get?',
      choices: boilerplateChoices
    }
  ])

  const boilerplate = boilerplates.find((boilerplate) => boilerplate.sys.id === selectionAnswers.boilerplate)
  const filePath = resolve('.', `boilerplate-${boilerplate.sys.id}.zip`)

  const tasks = new Listr([
    {
      title: `Creating CDA access token`,
      task: async (ctx) => {
        ctx.accessToken = await accessTokenCreate({
          name: `Boilerplate CDA access token`,
          description: `This token was generated for the ${boilerplate.name}`,
          spaceId,
          silent: true
        })
      }
    },
    {
      title: `Downloading ${boilerplate.name} boilerplate`,
      task: async (ctx) => {
        const response = await axios({
          url: `https://tools.contentful.com/boilerplates/${boilerplate.sys.id}/download?space_id=${spaceId}&access_token=${ctx.accessToken.accessToken}`,
          responseType: 'stream'
        })
        ctx.data = response.data
      }
    },
    {
      title: 'Writing files to disk',
      task: (ctx) => {
        return new Promise((resolve, reject) => {
          const writeStream = createWriteStream(filePath)
            .on('error', reject)
            .on('finish', resolve)

          ctx.data.pipe(writeStream)
        })
      }
    }
  ])

  await tasks.run()
  log()
  success(`${successEmoji} Finished downloading the ${boilerplate.name} boilerplate to:`)
  log(filePath)
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
}

export const handler = handle(downloadBoilerplate)
