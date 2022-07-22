import emojic from 'emojic'
import { handleAsyncError as handle } from '../../utils/async.mjs'
import { frame } from '../../utils/text.mjs'
import { success } from '../../utils/log.mjs'
import { proxyObjectToString } from '../../utils/proxy.mjs'

export const command = 'list'

export const desc = 'List all your configs'

export const builder = yargs => {
  return yargs.usage('Usage: contentful config list')
}

export const aliases = ['ls']

export const listHandler = async ({ context }) => {
  const configList = Object.keys(context).map(key => {
    if (key === 'proxy') {
      return `${emojic.gear}  ${key}: ${proxyObjectToString(context[key])}`
    } else {
      return `${emojic.gear}  ${key}: ${context[key]}`
    }
  })
  success(frame(configList.join('\n')))
}

export const handler = handle(listHandler)