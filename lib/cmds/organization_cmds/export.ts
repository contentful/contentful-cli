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
import { success } from '../../utils/log'

module.exports.command = 'export'

module.exports.desc = 'export your organization entities'

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
    .option('output-file', {
      alias: 'o',
      type: 'string',
      describe:
        'Output file. It defaults to ./migrations/<timestamp>-<organization-id>.json'
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
  header: string
  organizationId: string
  outputFile: string
}

async function organizationExport({
  context,
  header,
  organizationId,
  outputFile
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

  const tasks = new Listr([
    {
      title: 'Exporting Organization',
      task: async ctx => {
        return new Listr([
          {
            title: 'Exporting Concepts',
            task: async () => {
              ctx.concepts = await cursorPaginate({
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
              ctx.conceptSchemes = await cursorPaginate({
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
  ])

  const result = await tasks.run({ concepts: [], conceptSchemes: [] })
  await writeFileP(outputTarget, JSON.stringify(result, null, 2))
  success(`✅ Organization data exported to ${outputTarget}`)
}

module.exports.organizationExport = organizationExport

module.exports.handler = handle(organizationExport)
