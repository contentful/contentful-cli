/* eslint-disable @typescript-eslint/no-empty-function */
import Listr from 'listr'
import { noop } from 'lodash'
import path from 'path'
import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { cursorPaginate } from '../../utils/cursor-pagninate'
import { ensureDir, getPath, readFileP, writeFileP } from '../../utils/fs'
import { getHeadersFromOption } from '../../utils/headers'
import { success, log } from '../../utils/log'
import * as Papa from 'papaparse'
import { Taxonomy } from './taxonomy/taxonomy'

module.exports.command = 'taxonomy-transform'

module.exports.desc =
  'transform taxonomy from external format to contentful json format'

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
    .option('output-file', {
      alias: 'o',
      type: 'string',
      describe:
        'Output file. It defaults to ./data/<timestamp>-<organization-id>-transformed.json'
    })
    .option('transform-script', {
      alias: 't',
      describe: 'Script used to transform the taxonomy data',
      type: 'string',
      demandOption: true
    })
    .option('save-file', {
      describe: 'Save the transformed taxonomies as a json file',
      type: 'boolean',
      default: true
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
  outputFile?: string
  transformScript: string
  saveFile?: boolean
  silent?: boolean
}

export const defaultLocale = 'en-US'

export interface TransformContext {
  csv: {
    // parses any CSV to a JSON
    parse:
      | (<T>(
          csvString: string,
          config?: Papa.ParseConfig
        ) => Papa.ParseResult<T>)
      | (<T>(
          file: File,
          config?: Papa.ParseConfig
        ) => Promise<Papa.ParseResult<T>>)
  }
  fs: {
    // reads any file from disc
    readFile: typeof readFileP
    cwd: typeof process.cwd
  }
  taxonomy: Taxonomy
}

const transformContext: TransformContext = {
  csv: {
    parse: Papa.parse
  },
  fs: {
    readFile: readFileP,
    cwd: process.cwd
  },
  taxonomy: new Taxonomy()
}

async function taxonomyTransform({
  context,
  header,
  organizationId,
  outputFile,
  saveFile,
  transformScript,
  silent
}: Params) {
  const { managementToken } = context

  const client = await createPlainClient({
    accessToken: managementToken,
    feature: 'taxonomy-transform',
    headers: getHeadersFromOption(header),
    throttle: 8,
    logHandler: noop
  })

  const outputTarget = getPath(
    outputFile ||
      path.join('data', `${Date.now()}-${organizationId}-transformed.json`)
  )
  await ensureDir(path.dirname(outputTarget))

  const tasks = new Listr(
    [
      {
        title: 'Transforming taxonomy data',
        task: async ctx => {
          return new Listr([
            {
              title: 'Exporting Concepts',
              task: async () => {
                ctx.taxonomy.setExistingConcepts(
                  await cursorPaginate({
                    queryPage: pageUrl =>
                      client.concept.getMany({
                        organizationId,
                        query: { pageUrl }
                      })
                  })
                )
              }
            },
            {
              title: 'Exporting Concept Schemes',
              task: async () => {
                ctx.taxonomy.setExistingConceptSchemes(
                  await cursorPaginate({
                    queryPage: pageUrl =>
                      client.conceptScheme.getMany({
                        organizationId,
                        query: { pageUrl }
                      })
                  })
                )
              }
            },
            {
              title: 'Running transform script',
              task: async () => {
                const filePath = path.resolve(process.cwd(), transformScript)
                const transform = await import(filePath)

                await transform.default(ctx)
              }
            }
          ])
        }
      }
    ],
    { renderer: silent ? 'silent' : 'default' }
  )

  await tasks.run(transformContext)

  const result = transformContext.taxonomy.toJson()

  if (saveFile) {
    await writeFileP(outputTarget, JSON.stringify(result, null, 2))
    !silent &&
      success(`✅ Data transformed successfully and saved to ${outputTarget}`)
  } else {
    log(JSON.stringify(result, null, 2))
    !silent && success(`✅ Data transformed successfully`)
  }
}

module.exports.taxonomyTransform = taxonomyTransform

module.exports.handler = handle(taxonomyTransform)

export default taxonomyTransform
