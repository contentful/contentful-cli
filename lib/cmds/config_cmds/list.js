const { handleAsyncError: handle } = require('../../utils/async');
const emojic = require('emojic');
const { frame } = require('../../utils/text');
const { success } = require('../../utils/log');
const { proxyObjectToString } = require('../../utils/proxy');

export const command = 'list'

export const desc = 'List all your configs'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful config list')
}

export const aliases = ['ls']
export const listHandler = async ({context}) => {
  const configList = Object.keys(context).map((key) => {
    if (key === 'proxy') {
      return `${emojic.gear}  ${key}: ${proxyObjectToString(context[key])}`
    } else {
      return `${emojic.gear}  ${key}: ${context[key]}`
    }
  })
  success(frame(configList.join('\n')))
}

export const handler = handle(listHandler)
