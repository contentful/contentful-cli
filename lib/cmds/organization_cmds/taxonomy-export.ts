import Listr from 'listr'
import { noop } from 'lodash'
import path from 'path'
import type { Argv } from 'yargs'
import { handleAsyncError as handle } from '../../utils/async'
import { createPlainClient } from '../../utils/contentful-clients'
import { copyright } from '../../utils/copyright'
import { cursorPaginate } from '../../utils/cursor-pagninate'
import { ensureDir, getPath, writeFileP } from '../../utils/fs'
import { getHeadersFromOption } from '../../utils/headers'
import { success, log } from '../../utils/log'
import { ConceptProps, ConceptSchemeProps } from 'contentful-management'
import { buildTree, Nested } from './taxonomy/buildTree'

module.exports.command = 'taxonomy-export'

module.exports.desc = 'export your taxonomy with different formats'

enum ExportTaxonomyFormat {
  JSON = 'json',
  CSV = 'csv'
}

module.exports.builder = (yargs: Argv) => {
  return yargs
    .usage('Usage: contentful taxonomy export')
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
        'Output file. It defaults to ./data/<timestamp>-<organization-id>.json'
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
    .option('format', {
      alias: 'F',
      type: 'string',
      describe: 'format of the export file',
      default: 'json',
      choices: Object.values(ExportTaxonomyFormat)
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/organization/export',
        copyright
      ].join('\n')
    )
}

interface Params {
  context: { managementToken: string }
  header?: string
  organizationId: string
  outputFile?: string
  saveFile?: boolean
  silent?: boolean
  format?: ExportTaxonomyFormat
}

async function taxonomyExport({
  context,
  header,
  organizationId,
  outputFile,
  saveFile,
  silent,
  format
}: Params) {
  const { managementToken } = context

  const taxonomyTree: Record<string, Nested<ConceptProps>> = {}

  const client = await createPlainClient({
    accessToken: managementToken,
    feature: 'organization-export',
    headers: getHeadersFromOption(header),
    throttle: 8,
    logHandler: noop
  })

  let maxDepth = 1
  const csvExports: string[] = []

  const findAllHeirachy = (
    taxonomyTree: Nested<ConceptProps>[],
    depth: number
  ) => {
    maxDepth = Math.max(maxDepth, depth)

    for (let childIndex = 0; childIndex < taxonomyTree.length; childIndex++) {
      csvExports.push(
        `${',,'.repeat(depth + 1)}${taxonomyTree[childIndex].sys.id},${
          taxonomyTree[childIndex].prefLabel['en-US']
        }`
      )
      findAllHeirachy(taxonomyTree[childIndex].children, depth + 1)
    }
  }

  const outputTarget = getPath(
    outputFile ||
      path.join(
        'data',
        `${Date.now()}-${organizationId}.${format == 'csv' ? 'csv' : 'json'}`
      )
  )
  await ensureDir(path.dirname(outputTarget))

  const tasks = new Listr(
    [
      {
        title: 'Exporting Organization',
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
            }
          ])
        }
      }
    ],
    { renderer: silent ? 'silent' : 'default' }
  )

  const result = await tasks.run({
    taxonomy: { concepts: [], conceptSchemes: [] }
  })

  result.taxonomy.concepts.map((concept: ConceptProps) => {
    taxonomyTree[concept.sys.id] = { ...concept, children: [] }
  })

  result.taxonomy.concepts.map((concept: ConceptProps) => {
    concept.broader.map(broader => {
      taxonomyTree[broader.sys.id].children.push(taxonomyTree[concept.sys.id])
    })
  })

  if (format === 'csv') {
    const csvExportTitle: string[] = [
      'Concept scheme id',
      'Concept scheme preferred label'
    ]
    result.taxonomy.conceptSchemes.map((scheme: ConceptSchemeProps) => {
      const conceptInSchemeIds = scheme.concepts.map(c => c.sys.id)

      const concepts = result.taxonomy.concepts.filter((c: ConceptProps) =>
        conceptInSchemeIds.includes(c.sys.id)
      )

      const tree = buildTree(concepts, {
        getItemId: (c: ConceptProps) => c.sys.id,
        getParentIds: c => {
          const parentIds: string[] = []
          for (const b of c.broader) {
            if (conceptInSchemeIds.includes(b.sys.id)) {
              parentIds.push(b.sys.id)
            }
          }
          return parentIds.length ? parentIds : [null]
        }
      })

      csvExports.push(`${scheme.sys.id},${scheme.prefLabel['en-US']},`)
      findAllHeirachy(tree, 0)
    })

    Array.from(Array(maxDepth).keys()).forEach(d =>
      csvExportTitle.push(
        `Concept level ${d + 1} id, Concept level ${d + 1} preferred label`
      )
    )

    if (saveFile) {
      await writeFileP(
        outputTarget,
        [...[csvExportTitle.join(',')], ...csvExports].join('\n')
      )
    } else {
      log(JSON.stringify(result, null, 2))
    }
  } else {
    if (saveFile) {
      await writeFileP(outputTarget, JSON.stringify(result, null, 2))
    } else {
      log(JSON.stringify(result, null, 2))
    }
  }

  !silent && success(`✅ Taxonomy data exported to ${outputTarget}`)
}

module.exports.taxonomyExport = taxonomyExport

module.exports.handler = handle(taxonomyExport)

export default taxonomyExport
