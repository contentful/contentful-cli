import runMigration from 'contentful-migration/built/bin/cli'
import {handleAsyncError as handle} from '../../utils/async'
import { proxyObjectToString } from '../../utils/proxy'
import { version } from '../../../package.json'

import * as path from 'path'
import * as fs from 'fs'

export const command = 'migration'

export const desc = 'Parses and runs a migration script on a Contentful space'

export const builder = (yargs) => {
  yargs
    .usage('Parses and runs a migration script on a Contentful space.\n\nUsage: contentful migration [args] <path-to-script-file>\n\nScript: path to a migration script.')
    .demandCommand(1, 'Please provide the file containing the migration script.')
    .check((args) => {
      const filePath = path.resolve(process.cwd(), args._[2])
      if (fs.existsSync(filePath)) {
        args.filePath = filePath
        return true
      }
      throw new Error(`Cannot find file ${filePath}.`)
    })
    .version(version || 'Version only available on installed package')
    .option('space-id', {
      alias: 's',
      describe: 'ID of the space to run the migration script on'
    })
    .option('environment-id', {
      alias: 'e',
      describe: 'ID of the environment within the space to run the migration script on',
    })
    .option('management-token', {
      alias: 'mt',
      describe: 'The Contentful management token to use\nThis takes precedence over environment variables or .contentfulrc'
    })
    .option('yes', {
      alias: 'y',
      boolean: true,
      describe: 'Skips any confirmation before applying the migration script'
    })
    .option('quiet', {
      alias: 'q',
      boolean: false,
      describe: 'Reduce verbosity of information for the execution',
      default: false
    })
    .help('h')
    .alias('h', 'help')
    .example('contentful migration', '--space-id abcedef my-migration.js')
    .strict()
    .config('config', 'An optional configuration JSON file containing all the options for a single run')
    .epilog('Copyright 2019 Contentful')
}

export const migration = async (argv) => {
  const { context } = argv
  const { managementToken, activeSpaceId, activeEnvironmentId, proxy, rawProxy } = context
  const managementApplication = `contentful.cli/${version}`
  const managementFeature = `space-migration`

  const options = {
    ...argv,
    spaceId: activeSpaceId,
    managementApplication,
    managementFeature,
    accessToken: managementToken,
    environmentId: activeEnvironmentId
  }
  if (proxy) {
    // contentful-import and contentful-export
    // expect a string for the proxy config
    // and create agents from it
    options.proxy = proxyObjectToString(proxy)
    options.rawProxy = rawProxy
  }
  return runMigration(options)
}
export const handler = handle(migration)
