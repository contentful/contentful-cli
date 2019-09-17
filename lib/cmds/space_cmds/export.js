import * as log from '../../utils/log'
import runContentfulExport from 'contentful-export'
import {handleAsyncError as handle} from '../../utils/async'
import { proxyObjectToString } from '../../utils/proxy'
import emojic from 'emojic'
import { version } from '../../../package.json'

export const command = 'export'

export const desc = 'export a space data to a json file'

export const builder = function (yargs) {
  return yargs
    .option('space-id', {
      describe: 'ID of Space with source data',
      type: 'string'
    })
    .option('environment-id', {
      describe: 'ID of Environment with source data',
      type: 'string'
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('export-dir', {
      describe: 'Defines the path for storing the export json file (default path is the current directory)',
      type: 'string'
    })
    .option('include-drafts', {
      describe: 'Include drafts in the exported entries',
      type: 'boolean',
      default: false
    })
    .option('skip-content-model', {
      describe: 'Skip exporting content models',
      type: 'boolean',
      default: false
    })
    .option('skip-content', {
      describe: 'Skip exporting assets and entries',
      type: 'boolean',
      default: false
    })
    .option('skip-roles', {
      describe: 'Skip exporting roles and permissions',
      type: 'boolean',
      default: false
    })
    .option('skip-webhooks', {
      describe: 'Skip exporting webhooks',
      type: 'boolean',
      default: false
    })
    .option('content-only', {
      describe: 'only export entries and assets',
      type: 'boolean',
      default: false
    })
    .option('download-assets', {
      describe: 'With this flags assets will also be downloaded',
      type: 'boolean'
    })
    .option('max-allowed-limit', {
      describe: 'How many items per page per request',
      type: 'number',
      default: 1000
    })
    .option('host', {
      describe: 'Management API host',
      type: 'string',
      default: 'api.contentful.com'
    })
    .option('proxy', {
      describe: 'Proxy configuration in HTTP auth format: [http|https]://host:port or [http|https]://user:password@host:port',
      type: 'string'
    })
    .option('error-log-file', {
      describe: 'Full path to the error log file',
      type: 'string'
    })
    .option('query-entries', {
      describe: 'Exports only entries that matches these queries',
      type: 'array'
    })
    .option('query-assets', {
      describe: 'Exports only assets that matches these queries',
      type: 'array'
    })
    .option('content-file', {
      describe: 'The filename for the exported data',
      type: 'string'
    })
    .option('save-file', {
      describe: 'Save the export as a json file',
      type: 'boolean',
      default: true
    })
    .option('use-verbose-renderer', {
      describe: 'Display progress in new lines instead of displaying a busy spinner and the status in the same line. Useful for CI.',
      type: 'boolean',
      default: false
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
    .config('config', 'An optional configuration JSON file containing all the options for a single run')
    .epilog('Copyright 2019 Contentful')
}

export const exportSpace = async (argv) => {
  const { context, feature = 'space-export' } = argv
  const { managementToken, activeSpaceId, activeEnvironmentId, host, proxy, rawProxy } = context
  const managementApplication = `contentful.cli/${version}`
  const managementFeature = feature

  const options = {
    ...argv,
    spaceId: activeSpaceId,
    environmentId: activeEnvironmentId,
    managementApplication,
    managementFeature,
    managementToken,
    host
  }

  if (proxy) {
    // contentful-import and contentful-export
    // expect a string for the proxy config
    // and create agents from it
    options.proxy = proxyObjectToString(proxy)
    options.rawProxy = rawProxy
  }
  try {
    const exportResult = await runContentfulExport(options)
    log.success(`${emojic.sparkles} Done`)
    return exportResult
  } catch (err) {
    throw err
  }
}
export const handler = handle(exportSpace)
