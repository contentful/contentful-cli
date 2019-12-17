const fs = require('fs')
const { resolve } = require('path')

const inquirer = require('inquirer')
const chalk = require('chalk')
const Listr = require('listr')
const axios = require('axios')

const markdown = require('../utils/markdown')
const { handleAsyncError: handle } = require('../utils/async')
const { log, success } = require('../utils/log')
const { successEmoji } = require('../utils/emojis')
const { frame } = require('../utils/text')
const { accessTokenCreate } = require('./space_cmds/accesstoken_cmds/create')

module.exports.command = 'boilerplate'

module.exports.desc = 'Download a boilerplate'
const epilog = [
  'See more at:\nhttps://github.com/contentful/contentful-cli/tree/master/docs/boilerplate',
  'Copyright 2019 Contentful'
].join('\n')

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful boilerplate')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the Space the boilerplate will be connecting to'
    })
    .epilog(epilog)
}

async function getBoilerplates() {
  const boilerplatesResult = await axios({
    url: 'https://tools.contentful.com/boilerplates'
  })
  return boilerplatesResult.data
}

async function downloadBoilerplate({ context }) {
  const { activeSpaceId, managementToken } = context

  const boilerplatesResult = await getBoilerplates()

  const boilerplates = boilerplatesResult.items

  const boilerplateChoices = boilerplates.map(boilerplate => ({
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

  const boilerplate = boilerplates.find(
    boilerplate => boilerplate.sys.id === selectionAnswers.boilerplate
  )
  const filePath = resolve('.', `boilerplate-${boilerplate.sys.id}.zip`)

  const tasks = new Listr([
    {
      title: `Creating CDA access token`,
      task: async ctx => {
        ctx.accessToken = await accessTokenCreate({
          name: `Boilerplate CDA access token`,
          description: `This token was generated for the ${boilerplate.name}`,
          context: {
            activeSpaceId,
            managementToken
          },
          silent: true
        })
      }
    },
    {
      title: `Downloading ${boilerplate.name} boilerplate`,
      task: async ctx => {
        const response = await axios({
          url: `https://tools.contentful.com/boilerplates/${boilerplate.sys.id}/download?space_id=${activeSpaceId}&access_token=${ctx.accessToken.accessToken}`,
          responseType: 'stream'
        })
        ctx.data = response.data
      }
    },
    {
      title: 'Writing files to disk',
      task: ctx => {
        return new Promise((resolve, reject) => {
          const writeStream = fs
            .createWriteStream(filePath)
            .on('error', reject)
            .on('finish', resolve)

          ctx.data.pipe(writeStream)
        })
      }
    }
  ])

  await tasks.run()
  log()
  success(
    `${successEmoji} Finished downloading the ${boilerplate.name} boilerplate to:`
  )
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

module.exports.downloadBoilerplate = downloadBoilerplate

module.exports.handler = handle(downloadBoilerplate)
