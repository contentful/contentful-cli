import runContentfulImport from 'contentful-import'
import { handleAsyncError as handle } from '../../utils/async'
import { proxyObjectToString } from '../../utils/proxy'
import { version } from '../../../package.json'
import { warning } from '../../utils/log'
import { getHeadersFromOption } from '../../utils/headers'
import { copyright } from '../../utils/copyright'
import { Argv } from 'yargs'

export const command = 'import'

export const desc = 'import a space'

export const builder = (yargs: Argv) => {
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
      type: 'string'
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
    .epilog(copyright)
}

interface ProxyObject {
  host: string
  port: number
  auth: { username: string; password: string }
  isHttps: boolean
}

interface Context {
  managementToken?: string
  activeSpaceId?: string
  activeEnvironmentId?: string
  host?: string
  proxy?: string | ProxyObject
  rawProxy?: string
}

interface ImportSpaceProps {
  context: Context
  feature?: string
  update?: never
  header?: string
  proxy?: string
  content?: object
}

interface Options {
  spaceId?: string
  environmentId?: string
  managementApplication: string
  managementFeature: string
  managementToken?: string
  host?: string
  headers: string
  proxy?: string
  rawProxy?: string
}

export const importSpace = async (argv: ImportSpaceProps) => {
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

  const options: Options = {
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

export const handler = handle(importSpace)
