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
import {
  ConceptProps,
  ConceptSchemeProps,
  CreateConceptProps,
  CreateConceptSchemeProps
} from 'contentful-management'
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

const defaultLocale = 'en-US'

class Taxonomy {
  private existingConcepts: Array<Concept>
  private addedConcepts: Array<Concept>
  private updatedConcepts: Array<Concept>

  constructor() {
    this.addedConcepts = []
    this.updatedConcepts = []
    this.existingConcepts = []
  }

  toJson() {
    return {
      concepts: [
        ...this.existingConcepts.map(concept => concept.toJson()),
        ...this.addedConcepts.map(concept => concept.toJson()),
        ...this.updatedConcepts.map(concept => concept.toJson())
      ]
    }
  }

  setExistingConcepts(concepts: Array<ConceptProps>) {
    this.existingConcepts = concepts.map(
      concept => new Concept(concept.sys.id, concept)
    )
  }

  addConcept(
    id: string,
    init: Partial<Omit<CreateConceptProps, 'id'>> & {
      prefLabel: CreateConceptProps['prefLabel']
    }
  ) {
    if (this.existingConcepts.find(concept => concept.toJson().id === id)) {
      throw new Error(
        `Concept with id ${id} already exists, use updateConcept instead`
      )
    }

    const concept = new Concept(id, init)

    this.addedConcepts.push(concept)

    return concept
  }

  getConcept(id: string) {
    const existingConcept = this.existingConcepts.find(
      concept => concept.toJson().id === id
    )

    if (!existingConcept) {
      throw new Error(`Concept with id ${id} does not exist, use addConcept`)
    }

    this.updatedConcepts.push(existingConcept)
    return existingConcept
  }
}

class Concept {
  private model: CreateConceptProps & { id: string }

  public constructor(
    id: string,
    init: Partial<Omit<CreateConceptProps, 'id'>> & {
      prefLabel: CreateConceptProps['prefLabel']
    }
  ) {
    this.model = { id, ...init }
  }

  toJson() {
    return structuredClone(this.model)
  }

  setUri(uri: string | null) {
    this.model.uri = uri
    return this
  }

  setDefinition(definition: string | null) {
    if (!this.model.definition) {
      this.model.definition = {}
    }
    this.model.definition[defaultLocale] = definition
    return this
  }

  addAltLabel(altLabel: string) {
    if (!this.model.altLabels) {
      this.model.altLabels = { [defaultLocale]: [] }
    }
    this.model.altLabels[defaultLocale].push(altLabel)
    return this
  }

  removeAltLabel(altLabel: string) {
    if (this.model.altLabels) {
      this.model.altLabels[defaultLocale] = this.model.altLabels[
        defaultLocale
      ].filter(label => label !== altLabel)
    }
    return this
  }

  addHiddenLabel(hiddenLabel: string) {
    if (!this.model.hiddenLabels) {
      this.model.hiddenLabels = { [defaultLocale]: [] }
    }
    this.model.hiddenLabels[defaultLocale].push(hiddenLabel)
    return this
  }

  removeHiddenLabel(hiddenLabel: string) {
    if (this.model.hiddenLabels) {
      this.model.hiddenLabels[defaultLocale] = this.model.hiddenLabels[
        defaultLocale
      ].filter(label => label !== hiddenLabel)
    }
    return this
  }

  setEditorialNote(editorialNote: string | null) {
    if (!this.model.editorialNote) {
      this.model.editorialNote = {}
    }
    this.model.editorialNote[defaultLocale] = editorialNote
    return this
  }

  setHistoryNote(historyNote: string | null) {
    if (!this.model.historyNote) {
      this.model.historyNote = {}
    }
    this.model.historyNote[defaultLocale] = historyNote
    return this
  }

  setExample(example: string | null) {
    if (!this.model.example) {
      this.model.example = {}
    }
    this.model.example[defaultLocale] = example
    return this
  }

  setNote(note: string | null) {
    if (!this.model.note) {
      this.model.note = {}
    }
    this.model.note[defaultLocale] = note
    return this
  }

  setScopeNote(scopeNote: string | null) {
    if (!this.model.scopeNote) {
      this.model.scopeNote = {}
    }
    this.model.scopeNote[defaultLocale] = scopeNote
    return this
  }

  addNotation(notation: string) {
    if (!this.model.notations) {
      this.model.notations = []
    }
    this.model.notations.push(notation)
    return this
  }

  removeNotation(notation: string) {
    if (this.model.notations) {
      this.model.notations = this.model.notations.filter(n => n !== notation)
    }
    return this
  }

  addBroader(conceptId: string) {
    if (!this.model.broader) {
      this.model.broader = []
    }
    this.model.broader.push({
      sys: {
        id: conceptId,
        type: 'Link',
        linkType: 'TaxonomyConcept'
      }
    })
    return this
  }

  removeBroader(conceptId: string) {
    if (this.model.broader) {
      this.model.broader = this.model.broader.filter(
        concept => concept.sys.id !== conceptId
      )
    }
    return this
  }

  addRelated(conceptId: string) {
    if (!this.model.related) {
      this.model.related = []
    }
    this.model.related.push({
      sys: {
        id: conceptId,
        type: 'Link',
        linkType: 'TaxonomyConcept'
      }
    })
    return this
  }

  removeRelated(conceptId: string) {
    if (this.model.related) {
      this.model.related = this.model.related.filter(
        concept => concept.sys.id !== conceptId
      )
    }
    return this
  }
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
  taxonomy: Taxonomy
}

const transformContext: TransformContext = {
  csv: {
    parse: Papa.parse
  },
  fs: {
    readFile: readFileP
  },
  taxonomy: new Taxonomy()
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
                // TODO: add concept schemes
                await cursorPaginate({
                  queryPage: pageUrl =>
                    client.conceptScheme.getMany({
                      organizationId,
                      query: { pageUrl }
                    })
                })
              }
            },
            {
              title: 'Running transform script',
              task: async () => {
                const filePath = path.resolve(process.cwd(), transformFile)
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
  } else {
    log(JSON.stringify(result, null, 2))
  }

  !silent && success(`✅ Organization data exported to ${outputTarget}`)
}

module.exports.taxonomyTransform = taxonomyTransform

module.exports.handler = handle(taxonomyTransform)

export default taxonomyTransform
