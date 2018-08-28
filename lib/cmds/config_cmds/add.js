import { isEmpty, pickBy } from 'lodash'

import { setContext, getContext, storeRuntimeConfig } from '../../context'
import { handleAsyncError as handle } from '../../utils/async'
import { InvalidConfigOptionsError } from '../../utils/error'
import { successEmoji } from '../../utils/emojis.js'
import { success } from '../../utils/log'
import { proxyStringToObject } from '../../utils/proxy'

export const command = 'add'

export const desc = 'Adds a config'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful config add [options]')
    .option('management-token', {
      alias: 'mt',
      describe: 'API management token'
    })
    .option('active-space-id', {
      alias: 'as',
      describe: 'active space id'
    })
    .option('active-environment-id', {
      alias: 'ae',
      describe: 'active environment id'
    })
    .option('host', {
      alias: 'h',
      describe: 'management host'
    })
    .option('proxy', {
      alias: 'p',
      describe: 'Proxy configuration in HTTP auth format: host:port or user:password@host:port',
      type: 'string'
    })
    .option('raw-proxy', {
      alias: 'rp',
      describe: 'Pass proxy config as raw config instead of creating a httpsAgent',
      type: 'boolean'
    })
    .config('config', 'set all the config options at once')
}

export const addHandler = async (argv) => {
  const optionsToPick = ['managementToken', 'activeSpaceId', 'proxy', 'host', 'activeEnvironmentId', 'rawProxy']
  const opts = pickBy(argv, (value, key) => optionsToPick.includes(key) && value !== undefined)
  validateOptions(opts)
  const configs = transform(opts)
  await getContext()
  setContext(configs)
  await storeRuntimeConfig()
  success(`${successEmoji} config added successfully`)
}

export const handler = handle(addHandler)

function validateOptions (opts) {
  if (isEmpty(opts)) {
    throw new InvalidConfigOptionsError('Make sure to specify at least one option, for more info run the command `contentful config add -h`')
  }

  const proxySimpleExp = /.+:\d+/
  const proxyAuthExp = /.+:.+@.+:\d+/
  if (opts.proxy && !(proxySimpleExp.test(opts.proxy) || proxyAuthExp.test(opts.proxy))) {
    throw new InvalidConfigOptionsError('Please provide the proxy config in the following format:\nhost:port or user:password@host:port')
  }
}

function transform (opts) {
  if (opts.managementToken) {
    opts.cmaToken = opts.managementToken
    delete opts.managementToken
  }
  if (opts.proxy) {
    opts.proxy = proxyStringToObject(opts.proxy)
  }
  return clean(opts)
}
function clean (obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName]
    }
  }
  return obj
}
