const runContentfulImport = require('contentful-import')
const { handleAsyncError: handle } = require('../../utils/async')
const { proxyObjectToString } = require('../../utils/proxy')
const { version } = require('../../../package.json')
const { warning } = require('../../utils/log')
const { getHeadersFromOption } = require('../../utils/headers')
module.exports.command = 'import'

module.exports.desc = 'import a space'

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful space import --content-file <file>')
    .option('space-id', {
      describe: 'ID of the destination space',
      type: 'string'
    })
    .option('environment-id', {
      describe: 'ID the environment in the destination space',
      type: 'string',
      demand: false
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('content-file', {
      describe: 'JSON file that contains data to import into a space',
      type: 'string',
      demand: true
    })
    .option('content-model-only', {
      describe: 'Import only content types',
      type: 'boolean',
      default: false
    })
    .option('skip-content-model', {
      describe: 'Skip importing content types and locales',
      type: 'boolean',
      default: false
    })
    .option('skip-locales', {
      describe: 'Skip importing locales',
      type: 'boolean',
      default: false
    })
    .option('skip-content-publishing', {
      describe:
        'Skips content publishing. Creates content but does not publish it',
      type: 'boolean',
      default: false
    })
    .option('update', {
      describe: 'Update entries if they already exist',
      type: 'boolean',
      hidden: true
    })
    .option('error-log-file', {
      describe: 'Full path to the error log file',
      type: 'string'
    })
    .option('host', {
      describe: 'Management API host',
      type: 'string',
      default: 'api.contentful.com'
    })
    .option('proxy', {
      describe:
        'Proxy configuration in HTTP auth format: [http|https]://host:port or [http|https]://user:password@host:port',
      type: 'string'
    })
    .option('timeout', {
      describe: 'Timeout in milliseconds for API calls',
      type: 'number',
      default: 20000
    })
    .option('retry-limit', {
      describe: 'How many times to retry before an operation fails',
      type: 'number',
      default: 10
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .config(
      'config',
      'An optional configuration JSON file containing all the options for a single run'
    )
    .epilog('Copyright 2019 Contentful')
}

const importSpace = async argv => {
  if (argv.update !== undefined) {
    warning('The --update option has been deprecated and will be ignored.')
  }

  const { context, feature = 'space-import' } = argv
  const {
    managementToken,
    activeSpaceId,
    activeEnvironmentId,
    host,
    proxy,
    rawProxy
  } = context

  const options = {
    ...argv,
    spaceId: activeSpaceId,
    environmentId: activeEnvironmentId,
    managementApplication: `contentful.cli/${version}`,
    managementFeature: feature,
    managementToken,
    host,
    headers: getHeadersFromOption(argv.header)
  }

  if (proxy) {
    // contentful-import and contentful-export
    // expect a string for the proxy config
    // and create agents from it
    if (typeof proxy !== 'string') {
      options.proxy = proxyObjectToString(proxy)
    } else {
      options.proxy = proxy
    }

    options.rawProxy = rawProxy
  }

  return runContentfulImport(options)
}

module.exports.importSpace = importSpace
module.exports.handler = handle(importSpace)
