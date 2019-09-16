import Table from 'cli-table3'

import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { log } from '../../../utils/log'
import paginate from '../../../utils/pagination'

export const command = 'list'

export const desc = 'List your delivery access tokens'
const epilog = [
  'See more at:\nhttps://github.com/contentful/contentful-cli/tree/master/docs/space/accesstoken/list',
  'Copyright 2019 Contentful'
].join('\n')

export const builder = (yargs) => {
  return yargs
    .option('management-token', {
      alias: 'mt',
      describe: 'Contentful management API token',
      type: 'string'
    })
    .option('space-id', { alias: 's', type: 'string', describe: 'Space id' })
    .usage('Usage: contentful space accesstoken list')
    .epilog(epilog)
}

export const aliases = ['ls']

async function accessTokenList ({ context }) {
  const { managementToken, activeSpaceId } = context

  const client = await createManagementClient({
    accessToken: managementToken,
    feature: 'space-access_token-list'
  })

  const space = await client.getSpace(activeSpaceId)
  const result = await paginate({ client: space, method: 'getApiKeys' })

  const tokens = result.items.sort((a, b) => a.name.localeCompare(b.name))

  const table = new Table({
    head: ['Name', 'Description', 'Token']
  })

  tokens.forEach((token) => {
    table.push([token.name, token.description, token.accessToken])
  })

  log(table.toString())
}

export const handler = handle(accessTokenList)
