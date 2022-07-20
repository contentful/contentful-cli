import { isEmpty, pickBy } from 'lodash-es'
import { setContext, storeRuntimeConfig } from '../../context.mjs'
import { handleAsyncError as handle } from '../../utils/async.mjs'
import { InvalidConfigOptionsError } from '../../utils/error.mjs'
import { successEmoji } from '../../utils/emojis.mjs'
import { success } from '../../utils/log.mjs'
import { proxyStringToObject } from '../../utils/proxy.mjs'
import { error } from '../../utils/log.mjs'

export const command = 'add'

export const desc = 'Adds a config'

export const builder = yargs => {
  return yargs
    .usage('Usage: contentful config add [options]')
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('active-space-id', {
      alias: 'as',
      describe: 'active space id',
      type: 'string'
    })
    .option('active-environment-id', {
      alias: 'ae',
      describe: 'active environment id',
      type: 'string'
    })
    .option('insecure', {
      describe: 'Use HTTP instead of TLS (default: false)',
      hidden: true,
      type: 'boolean'
    })
    .option('host', {
      alias: 'ho',
      describe: 'management host',
      type: 'string'
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
    .requiresArg([
      'management-token',
      'active-space-id',
      'active-environment-id',
      'host',
      'proxy'
    ])
    .config('config', 'set all the config options at once')
    .fail(msg => {
      error(msg)
      process.exit(1)
    })
}

export const addHandler = async argv => {
  const optionsToPick = [
    'managementToken',
    'activeSpaceId',
    'activeEnvironmentId',
    'insecure',
    'host',
    'proxy',
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

export const handler = handle(addHandler)

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
