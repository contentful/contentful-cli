/* eslint-disable @typescript-eslint/no-empty-function */
import Listr from 'listr'
import { noop, omit } from 'lodash'
import path from 'path'
import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { cursorPaginate } from '../../utils/cursor-pagninate'
import { ensureDir, getPath, readFileP, writeFileP } from '../../utils/fs'
import { getHeadersFromOption } from '../../utils/headers'
import { success, log } from '../../utils/log'
import {
  ConceptProps,
  ConceptSchemeProps,
  CreateConceptProps,
  CreateConceptSchemeProps
} from 'contentful-management'
import { CreateConceptWithIdProps } from './utils/concept'
import { CreateConceptSchemeWithIdProps } from './utils/concept-scheme'
import { TaxonomyJson } from './utils/taxonomy'
import PQueue from 'p-queue'
import {
  displayErrorLog,
  LogMessage,
  setupLogging,
  writeErrorLogFile
} from 'contentful-batch-libs/dist/logging'

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
}

interface Params {
  context: { managementToken: string }
  header?: string
  organizationId: string
  contentFile: string
  silent?: boolean
}

export interface ImportContext {
  data: {
    taxonomy?: TaxonomyJson
  }
  requestQueue: PQueue
}

const ONE_SECOND = 1000

const importContext: ImportContext = {
  data: {},
  requestQueue: new PQueue({
    concurrency: 1,
    interval: ONE_SECOND,
    intervalCap: 1,
    carryoverConcurrencyCount: true
  })
}

interface ErrorMessage {
  ts: string
  level: 'error'
  error: Error
}

async function importCommand({
  context,
  header,
  organizationId,
  contentFile,
  silent
}: Params) {
  const { managementToken } = context

  const client = await createPlainClient({
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
        task: async ctx => {
          return new Listr([
            {
              title: 'Read content file',
              task: async () => {
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
              title: 'Create concepts',
              task: async ctx => {
                const concepts = ctx.data.taxonomy?.concepts || []

                if (!concepts.length) {
                  return
                }

                await Promise.all(
                  concepts.map(
                    (concept: ConceptProps | CreateConceptWithIdProps) =>
                      ctx.requestQueue.add(() =>
                        client.concept
                          .create(
                            {
                              organizationId: organizationId
                            },
                            omit(concept, ['sys', 'broader'])
                          )
                          .catch(err => {
                            log.push({
                              ts: new Date().toISOString(),
                              level: 'error',
                              error: err as Error
                            })
                          })
                      )
                  )
                )
              }
            },
            {
              title: 'Create conceps relationships',
              task: async () => {}
            },
            {
              title: 'Create concept schemes',
              task: async () => {}
            }
          ])
        }
      }
    ],
    { renderer: silent ? 'silent' : 'default' }
  )

  await tasks.run(importContext).then(() => {
    if (log.length > 0) {
      displayErrorLog(log)
      writeErrorLogFile('error-log', log)
    }
  })
}

module.exports.import = importCommand

module.exports.handler = handle(importCommand)

export default importCommand
