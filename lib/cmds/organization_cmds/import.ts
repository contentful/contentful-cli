/* eslint-disable @typescript-eslint/no-empty-function */
import Listr from 'listr'
import { noop } from 'lodash'
import path from 'path'
import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { readFileP } from '../../utils/fs'
import { getHeadersFromOption } from '../../utils/headers'
import { TaxonomyJson } from './taxonomy/taxonomy'
import PQueue from 'p-queue'
import {
  displayErrorLog,
  setupLogging,
  writeErrorLogFile
} from 'contentful-batch-libs/dist/logging'
import taxonomyImport from './taxonomy/taxonomy-import'
import { PlainClientAPI } from 'contentful-management'

module.exports.command = 'import'

module.exports.desc = 'import organization level entities'

module.exports.builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful organization taxonomy-transform')
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('organization-id', {
      alias: 'oid',
      describe: 'ID of Organization with source data',
      type: 'string',
      demandOption: true
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .option('content-file', {
      alias: 'f',
      type: 'string',
      describe: 'Content file with entities that need to be imported',
      demandOption: true
    })
    .option('silent', {
      alias: 's',
      type: 'boolean',
      describe: 'Suppress any log output',
      default: false
    })
    .option('error-log-file', {
      describe: 'Full path to the error log file',
      type: 'string'
    })
}

export interface OrgImportParams {
  context: { managementToken: string }
  header?: string
  organizationId: string
  contentFile: string
  silent?: boolean
  errorLogFile?: string
}

export interface OrgImportContext {
  data: {
    taxonomy?: TaxonomyJson
  }
  requestQueue: PQueue
  cmaClient: PlainClientAPI | null
}

const ONE_SECOND = 1000

const importContext: OrgImportContext = {
  data: {},
  requestQueue: new PQueue({
    concurrency: 1,
    interval: ONE_SECOND,
    intervalCap: 1,
    carryoverConcurrencyCount: true
  }),
  cmaClient: null
}

interface ErrorMessage {
  ts: string
  level: 'error'
  error: Error
}

async function importCommand(params: OrgImportParams) {
  const { context, header, organizationId, contentFile, silent, errorLogFile } =
    params
  const { managementToken } = context

  importContext.cmaClient = await createPlainClient({
    accessToken: managementToken,
    feature: 'org-import',
    headers: getHeadersFromOption(header),
    throttle: 8,
    logHandler: noop
  })

  const log: ErrorMessage[] = []
  setupLogging(log)

  const tasks = new Listr(
    [
      {
        title: 'Import organization level entities',
        task: async () => {
          return new Listr([
            {
              title: 'Read content file',
              task: async ctx => {
                const content = await readFileP(
                  path.resolve(__dirname, contentFile),
                  'utf8'
                )
                const data = JSON.parse(content)

                if (data.taxonomy) {
                  ctx.data.taxonomy = data.taxonomy
                }
              }
            },
            {
              title: 'Import taxonomies',
              task: async ctx => {
                return taxonomyImport(params, ctx)
              }
            }
          ])
        }
      }
    ],
    { renderer: silent ? 'silent' : 'default' }
  )

  await tasks
    .run(importContext)
    .catch(err => {
      log.push({
        ts: new Date().toISOString(),
        level: 'error',
        error: err as Error
      })
    })
    .then(() => {
      if (log.length > 0) {
        displayErrorLog(log)
        const errorLogFilePath =
          errorLogFile ||
          `${Date.now()}-${organizationId}-import-org-error-log.json`
        writeErrorLogFile(errorLogFilePath, log)
      }
    })
}

module.exports.import = importCommand

module.exports.handler = handle(importCommand)

export default importCommand
