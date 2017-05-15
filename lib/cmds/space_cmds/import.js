import {getContext} from '../../context'
import {error} from '../../utils/log'
import runContentfulImport from 'contentful-import'
import {handleAsyncError as handle} from '../../utils/async'
export const command = 'import'

export const desc = 'import a space'

export const builder = (yargs) => {
  return yargs
    .option('space-id', {
      describe: 'space to import',
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
    .option('error-log-file', {
      describe: 'Full path to the error log file',
      type: 'string'
    })
    .option('managementHost', {
      describe: 'Management API host',
      type: 'string',
      default: 'api.contentful.com'
    })
    .config('config', 'An optional configuration JSON file containing all the options for a single run')
}

export const importSpace = async (argv) => {
  const context = await getContext()
  if (!context.cmaToken || !context.activeSpaceId) {
    error('Please log in first, and set an active space using `contentful space use <space-id>`')
    return
  }
  argv.spaceId = argv.spaceId || context.activeSpaceId
  argv.managementToken = context.cmaToken
  argv.managementHeaders = {'X-Contentful-Skip-Transformation': true}
  return runContentfulImport(argv)
}
export const handler = handle(importSpace)
