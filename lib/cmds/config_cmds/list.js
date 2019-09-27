const { handleAsyncError: handle } = require('../../utils/async')
const emojic = require('emojic')
const { frame } = require('../../utils/text')
const { success } = require('../../utils/log')
const { proxyObjectToString } = require('../../utils/proxy')

module.exports.command = 'list'

module.exports.desc = 'List all your configs'

module.exports.builder = yargs => {
  return yargs.usage('Usage: contentful config list')
}

module.exports.aliases = ['ls']
const listHandler = async ({ context }) => {
  const configList = Object.keys(context).map(key => {
    if (key === 'proxy') {
      return `${emojic.gear}  ${key}: ${proxyObjectToString(context[key])}`
    } else {
      return `${emojic.gear}  ${key}: ${context[key]}`
    }
  })
  success(frame(configList.join('\n')))
}

module.exports.listHandler = listHandler

module.exports.handler = handle(listHandler)
