import Table from 'cli-table3'

import { handleAsyncError as handle } from '../../utils/async'
import { createManagementClient } from '../../utils/contentful-clients'
import { log } from '../../utils/log'
import paginate from '../../utils/pagination'

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
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/organization/list',
        'Copyright 2018 Contentful, this is a BETA release'
      ].join('\n')
    )
}

export const aliases = ['ls']

async function organizationList ({ context }) {
  const { managementToken } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'organization-list'
  })

  const result = await paginate({ client, method: 'getOrganizations' })

  const organizations = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Organization name', 'Organization id']
  })

  organizations.forEach(({ sys, name }) => {
    table.push([name, sys.id])
  })

  log(table.toString())
}

export const handler = handle(organizationList)
