import Table from 'cli-table3'
import { handleAsyncError as handle } from '../../utils/async.js'
import { createManagementClient } from '../../utils/contentful-clients.js'
import { getHeadersFromOption } from '../../utils/headers.js'
import { log } from '../../utils/log.js'
import paginate from '../../utils/pagination.js'

export const command = 'list'

export const desc = 'List your organizations'

export const builder = yargs => {
  return yargs
    .usage('Usage: contentful organization list')
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/organization/list',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

export const aliases = ['ls']

export async function organizationList({ context, header }) {
  const { managementToken } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'organization-list',
    headers: getHeadersFromOption(header)
  })

  const result = await paginate({ client, method: 'getOrganizations' })

  const organizations = result.items.sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const table = new Table({
    head: ['Organization name', 'Organization id']
  })

  organizations.forEach(({ sys, name }) => {
    table.push([name, sys.id])
  })

  log(table.toString())
}

export const handler = handle(organizationList)
