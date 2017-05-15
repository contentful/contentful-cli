import {getContext} from '../../context'
import {error, success} from '../../utils/log'
import runContentfulExport from 'contentful-export'
import {handleAsyncError as handle} from '../../utils/async'
import emojic from 'emojic'

export const command = 'export'

export const desc = 'export a space data to a json file'

export const builder = function (yargs) {
  return yargs
    .option('space-id', {
      describe: 'space to export',
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
  .option('download-assets', {
    describe: 'With this flags assets will also be downloaded',
    type: 'boolean'
  })
  .option('max-allowed-limit', {
    describe: 'How many items per page per request',
    type: 'number',
    default: 1000
  })
  .option('management-host', {
    describe: 'Management API host',
    type: 'string',
    default: 'api.contentful.com'
  })
  .option('error-log-file', {
    describe: 'Full path to the error log file',
    type: 'string'
  })
  .option('save-file', {
    describe: 'Save the export as a json file',
    type: 'boolean',
    default: true
  })
  .config('config', 'An optional configuration JSON file containing all the options for a single run')
}

export const exportSpace = async (argv) => {
  const context = await getContext()
  if (!context.cmaToken) {
    error('Please log in first')
    return
  }
  if (!argv.spaceId && !context.activeSpaceId) {
    error('Please provide a spaceId using --space-id <my-id> or, set an active space using `contentful space use <space-id>`')
  }
  argv.sourceSpace = argv.spaceId || context.activeSpaceId
  argv.sourceManagementToken = context.cmaToken
  argv.managementHeaders = {'X-Contentful-Skip-Transformation': true}
  return runContentfulExport(argv).then((result) => {
    success(`${emojic.sparkles} Done`)
  })
}
export const handler = handle(exportSpace)
