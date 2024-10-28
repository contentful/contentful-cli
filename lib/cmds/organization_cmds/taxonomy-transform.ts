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
import { ConceptProps, ConceptSchemeProps } from 'contentful-management'
import * as Papa from 'papaparse'

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
    .option('transform-file', {
      alias: 't',
      describe: 'File used to transform the taxonomy data',
      type: 'string',
      demandOption: true
    })
    .option('save-file', {
      describe: 'Save the export as a json file',
      type: 'boolean',
      default: true
    })
    .option('silent', {
      alias: 'S',
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
  transformFile: string
  saveFile?: boolean
  silent?: boolean
}

interface TransformContext {
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
  }
  taxonomy: {
    // the current contentful state for concepts
    concepts: Array<ConceptProps>
    // the current contentful state for concept schemes
    conceptSchemes: Array<ConceptSchemeProps>
    // adds a concept
    addConcept: (concept: Omit<ConceptProps, 'sys'>, id?: string) => void
    // updates a concept
    updateConcept: (concept: ConceptProps, id: string) => void
    // adds a concept scheme
    addConceptScheme: (
      conceptScheme: Omit<ConceptSchemeProps, 'sys'>,
      id?: string
    ) => void
    // updates a concept scheme
    updateConceptScheme: (conceptScheme: ConceptSchemeProps, id: string) => void
  }
}

const transformContext: TransformContext = {
  csv: {
    parse: Papa.parse
  },
  fs: {
    readFile: readFileP
  },
  taxonomy: {
    concepts: [],
    conceptSchemes: [],
    addConcept: () => {},
    updateConcept: () => {},
    addConceptScheme: () => {},
    updateConceptScheme: () => {}
  }
}

transformContext.taxonomy.addConcept = (concept, id) => {
  transformContext.taxonomy.concepts.push({
    sys: {
      id: id || Date.now().toString()
    } as unknown as ConceptProps['sys'],
    ...concept
  })
}

transformContext.taxonomy.addConceptScheme = (conceptScheme, id) => {
  transformContext.taxonomy.conceptSchemes.push({
    sys: {
      id: id || Date.now().toString()
    } as unknown as ConceptSchemeProps['sys'],
    ...conceptScheme
  })
}

transformContext.taxonomy.updateConcept = (concept, id) => {
  const index = transformContext.taxonomy.concepts.findIndex(
    c => c.sys.id === id
  )
  if (index !== -1) {
    transformContext.taxonomy.concepts[index] = concept
  }
}

transformContext.taxonomy.updateConceptScheme = (conceptScheme, id) => {
  const index = transformContext.taxonomy.conceptSchemes.findIndex(
    c => c.sys.id === id
  )
  if (index !== -1) {
    transformContext.taxonomy.conceptSchemes[index] = conceptScheme
  }
}

async function taxonomyTransform({
  context,
  header,
  organizationId,
  outputFile,
  saveFile,
  transformFile,
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
                ctx.taxonomy.concepts = await cursorPaginate({
                  queryPage: pageUrl =>
                    client.concept.getMany({
                      organizationId,
                      query: { pageUrl }
                    })
                })
              }
            },
            {
              title: 'Exporting Concept Schemes',
              task: async () => {
                ctx.taxonomy.conceptSchemes = await cursorPaginate({
                  queryPage: pageUrl =>
                    client.conceptScheme.getMany({
                      organizationId,
                      query: { pageUrl }
                    })
                })
              }
            },
            {
              title: 'Transforming data',
              task: async () => {
                const filePath = path.resolve(process.cwd(), transformFile)
                console.log('debug')
                const transform = await import(filePath)
                console.log({ transform })

                await transform.default(ctx)
              }
            }
          ])
        }
      }
    ],
    { renderer: silent ? 'silent' : 'default' }
  )

  const result = await tasks.run(transformContext)

  if (saveFile) {
    await writeFileP(outputTarget, JSON.stringify(result, null, 2))
  } else {
    log(JSON.stringify(result, null, 2))
  }

  !silent && success(`✅ Organization data exported to ${outputTarget}`)
}

module.exports.taxonomyTransform = taxonomyTransform

module.exports.handler = handle(taxonomyTransform)

export default taxonomyTransform
