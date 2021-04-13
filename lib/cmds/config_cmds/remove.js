const { handleAsyncError: handle } = require('../../utils/async')
const { success } = require('../../utils/log')
const { successEmoji } = require('../../utils/emojis.js')
const {
  setContext,
  emptyContext,
  storeRuntimeConfig
} = require('../../context')

module.exports.command = 'remove'

module.exports.desc = 'Removes a config from ~/.contentfulrc.json'

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful config remove [options]')
    .option('management-token', {
      alias: 'mt',
      describe: 'Remove the API management token from the config',
      type: 'boolean',
      default: false
    })
    .option('active-space-id', {
      alias: 'as',
      describe: 'Remove the active space id from the config',
      type: 'boolean',
      default: false
    })
    .option('active-environment-id', {
      alias: 'ae',
      describe: 'Remove the active environment id from the config'
    })
    .option('insecure', {
      describe: 'Use HTTP instead of TLS (default: false)',
      hidden: true,
      type: 'boolean'
    })
    .option('host', {
      alias: 'ho',
      describe: 'Remove the management host from the config'
    })
    .option('proxy', {
      alias: 'p',
      describe: 'Remove the proxy from the config',
      type: 'boolean',
      default: false
    })
    .option('raw-proxy', {
      alias: 'rp',
      describe:
        'Pass proxy config as raw config instead of creating a httpsAgent',
      type: 'boolean'
    })
    .option('all', {
      describe: 'Remove all the things from the config',
      type: 'boolean',
      default: false
    })
}

const removeHandler = async argv => {
  let options = { ...argv.context }
  if (argv.all) {
    options = {}
  } else {
    const contextKeys = [
      'managementToken',
      'activeSpaceId',
      'activeEnvironmentId',
      'insecure',
      'host',
      'proxy',
      'rawProxy'
    ]
    contextKeys.forEach(key => argv[key] && delete options[key])
  }
  emptyContext()
  setContext(options)
  await storeRuntimeConfig()
  success(`${successEmoji} config removed successfully`)
}

module.exports.removeHandler = removeHandler

module.exports.handler = handle(removeHandler)
