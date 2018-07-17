import {getContext} from '../../context'
import runContentfulImport from 'contentful-import'
import {handleAsyncError as handle} from '../../utils/async'
import { assertLoggedIn, assertSpaceIdProvided } from '../../utils/assertions'
import { proxyObjectToString } from '../../utils/proxy'
import { version } from '../../../package.json'
export const command = 'import'

export const desc = 'import a space'

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space import --content-file <file>')
    .option('space-id', {
      describe: 'ID of the destination space',
      type: 'string'
    })
    .option('environment-id', {
      describe: 'ID the environment in the destination space',
      type: 'string',
      default: 'master',
      demand: false
    })
    .option('management-token', {
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('content-file', {
      describe: 'JSON file that contains data to be import to your space',
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
      describe: 'Skips content publishing. Creates content but does not publish it',
      type: 'boolean',
      default: false
    })
    .option('no-update', {
      describe: 'Skips updating entries if they already exist',
      type: 'boolean',
      default: false
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
      describe: 'Proxy configuration in HTTP auth format: [http|https]://host:port or [http|https]://user:password@host:port',
      type: 'string'
    })
    .config('config', 'An optional configuration JSON file containing all the options for a single run')
    .epilog('Copyright 2018 Contentful, this is a BETA release')
}

export const importSpace = async (argv) => {
  await assertLoggedIn(argv)
  await assertSpaceIdProvided(argv)

  let { cmaToken, activeSpaceId, proxy, host = 'api.contentful.com' } = await getContext()
  const spaceId = argv.spaceId || activeSpaceId
  const managementToken = argv.managementToken || cmaToken
  const managementApplication = `contentful.cli/${version}`
  const managementFeature = `space-import`
  host = argv.host || host

  const options = { ...argv, spaceId, managementApplication, managementFeature, managementToken, host }
  if (proxy) {
    // contentful-import and contentful-export
    // expect a string for the proxy config
    // and create agents from it
    options.proxy = proxyObjectToString(proxy)
  }
  return runContentfulImport(options)
}
export const handler = handle(importSpace)
