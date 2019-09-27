const { isEmpty, pickBy } = require('lodash')

const { setContext, storeRuntimeConfig } = require('../../context')
const { handleAsyncError: handle } = require('../../utils/async')
const { InvalidConfigOptionsError } = require('../../utils/error')
const { successEmoji } = require('../../utils/emojis.js')
const { success } = require('../../utils/log')
const { proxyStringToObject } = require('../../utils/proxy')

module.exports.command = 'add'

module.exports.desc = 'Adds a config'

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful config add [options]')
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token'
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
      alias: 'ho',
      describe: 'management host'
    })
    .option('proxy', {
      alias: 'p',
      describe:
        'Proxy configuration in HTTP auth format: host:port or user:password@host:port',
      type: 'string'
    })
    .option('raw-proxy', {
      alias: 'rp',
      describe:
        'Pass proxy config as raw config instead of creating a httpsAgent',
      type: 'boolean'
    })
    .config('config', 'set all the config options at once')
}

const addHandler = async argv => {
  const optionsToPick = [
    'managementToken',
    'activeSpaceId',
    'proxy',
    'host',
    'activeEnvironmentId',
    'rawProxy'
  ]
  const opts = pickBy(
    argv,
    (value, key) => optionsToPick.includes(key) && value !== undefined
  )
  validateOptions(opts)
  const configs = transform(opts)
  setContext(configs)
  await storeRuntimeConfig()
  success(`${successEmoji} config added successfully`)
}

module.exports.addHandler = addHandler
module.exports.handler = handle(addHandler)

function validateOptions(opts) {
  if (isEmpty(opts)) {
    throw new InvalidConfigOptionsError(
      'Make sure to specify at least one option, for more info run the command `contentful config add -h`'
    )
  }

  const proxySimpleExp = /.+:\d+/
  const proxyAuthExp = /.+:.+@.+:\d+/
  if (
    opts.proxy &&
    !(proxySimpleExp.test(opts.proxy) || proxyAuthExp.test(opts.proxy))
  ) {
    throw new InvalidConfigOptionsError(
      'Please provide the proxy config in the following format:\nhost:port or user:password@host:port'
    )
  }
}

function transform(opts) {
  if (opts.proxy) {
    opts.proxy = proxyStringToObject(opts.proxy)
  }
  return clean(opts)
}
function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName]
    }
  }
  return obj
}
