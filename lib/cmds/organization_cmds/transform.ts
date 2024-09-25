import { ConceptProps, ConceptSchemeProps } from 'contentful-management'
import { Listr } from 'listr2'
import { noop } from 'lodash'
import * as fs from 'node:fs'
import path, { relative, resolve } from 'path'
import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { copyright } from '../../utils/copyright'
import { cursorPaginate } from '../../utils/cursor-pagninate'
import { ensureDir, getPath, writeFileP } from '../../utils/fs'
import { getHeadersFromOption } from '../../utils/headers'
import { success } from '../../utils/log'
import Papa, { ParseConfig } from 'papaparse'

module.exports.command = 'transform'

module.exports.desc = 'transform data to organization entities'

module.exports.builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful organization export')
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
    .option('transform-file', {
      alias: 't',
      type: 'string',
      describe: 'Transform file'
    })
    .option('output-file', {
      alias: 'o',
      type: 'string',
      describe:
        'Output file. It defaults to ./data/<timestamp>-<organization-id>.json'
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/organization/export',
        copyright
      ].join('\n')
    )
}

const createFsContext = (transformPath: string) => ({
  readFile: (path: string) => {
    return fs.promises.readFile(resolve(transformPath, path), 'utf-8')
  }
})

const createCSVContext = (transformPath: string) => ({
  parse: (csvString: string, config?: ParseConfig) => {
    return Papa.parse(csvString, config)
  },
  parseFile: async (filePath: string, config?: ParseConfig) => {
    const content = await fs.promises.readFile(
      resolve(transformPath, filePath),
      'utf-8'
    )
    return Papa.parse(content, config)
  }
})

interface TransformContext {
  concepts: ConceptProps[]
  conceptSchemes: ConceptSchemeProps[]
  updateConcept: (concept: ConceptProps) => void
  addConcept: (concept: Omit<ConceptProps, 'sys'>) => void
  deleteConcept: (conceptId: string) => void
  fs: ReturnType<typeof createFsContext>
  csv: ReturnType<typeof createCSVContext>
}

type TransformFunction = (transformContext: TransformContext) => Promise<void>

interface Params {
  context: { managementToken: string }
  header: string
  organizationId: string
  outputFile: string
  transformFile: string
}

async function organizationExport({
  context,
  header,
  organizationId,
  outputFile,
  transformFile
}: Params) {
  const { managementToken } = context

  const client = await createPlainClient({
    accessToken: managementToken,
    feature: 'organization-export',
    headers: getHeadersFromOption(header),
    throttle: 8,
    logHandler: noop
  })

  const outputTarget = getPath(
    outputFile || path.join('data', `${Date.now()}-${organizationId}.json`)
  )
  await ensureDir(path.dirname(outputTarget))

  const transform: { default: TransformFunction } = await import(
    resolve(__dirname, relative(__dirname, transformFile))
  )

  const tasks = new Listr(
    [
      {
        title: 'Loading Organization',
        task: async (_, rootTask) => {
          return new Listr([
            {
              title: 'Fetching Concepts',
              task: async (ctx, task) => {
                ctx.concepts = await cursorPaginate({
                  queryPage: pageUrl =>
                    client.concept.getMany({
                      organizationId,
                      query: { pageUrl }
                    })
                })
                task.title = `${ctx.concepts.length} Concepts fetched`
              }
            },
            {
              title: 'Fetching Concept Schemes',
              task: async (ctx, task) => {
                ctx.conceptSchemes = await cursorPaginate({
                  queryPage: pageUrl =>
                    client.conceptScheme.getMany({
                      organizationId,
                      query: { pageUrl }
                    })
                })
                task.title = `${ctx.conceptSchemes.length} Concept Schemes fetched`
              }
            },
            {
              title: 'Execute transform',
              task: async (ctx, task) => {
                const { add, update, del } = ctx.result.concepts
                await transform.default({
                  fs: createFsContext(
                    path.dirname(
                      resolve(__dirname, relative(__dirname, transformFile))
                    )
                  ),
                  csv: createCSVContext(
                    path.dirname(
                      resolve(__dirname, relative(__dirname, transformFile))
                    )
                  ),
                  concepts: ctx.concepts,
                  conceptSchemes: ctx.conceptSchemes,
                  updateConcept: async concept => update.push(concept),
                  addConcept: async concept => add.push(concept),
                  deleteConcept: async conceptId => del.push(conceptId)
                })
                task.title = `Transform executed on ${
                  ctx.result.concepts.add.length +
                  ctx.result.concepts.update.length +
                  ctx.result.concepts.del.length
                } Concepts`
                rootTask.title = 'Organization data transformed'
              }
            }
          ])
        }
      }
    ],
    { rendererOptions: { showTimer: true, collapse: false } }
  )

  const ctx = await tasks.run({
    concepts: [],
    conceptSchemes: [],
    result: { concepts: { add: [], update: [], del: [] } }
  })
  await writeFileP(
    outputTarget,
    JSON.stringify(
      {
        concepts: [...ctx.result.concepts.add, ...ctx.result.concepts.update],
        conceptSchemes: ctx.conceptSchemes
      },
      null,
      2
    )
  )
  console.log('\n')
  success(`✅ Organization data exported to ${outputTarget}`)
}

module.exports.organizationExport = organizationExport

module.exports.handler = handle(organizationExport)
