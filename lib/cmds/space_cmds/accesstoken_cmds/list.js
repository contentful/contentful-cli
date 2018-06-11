import Table from 'cli-table3'

import { getContext } from '../../../context'
import { assertLoggedIn, assertSpaceIdProvided } from '../../../utils/assertions'
import { handleAsyncError as handle } from '../../../utils/async'
import { createManagementClient } from '../../../utils/contentful-clients'
import { log } from '../../../utils/log'
import normalizer from '../../../utils/normalizer'
import paginate from '../../../utils/pagination'

export const command = 'list'

export const desc = 'List your delivery access tokens'
const epilog = [
  'See more at:\nhttps://github.com/contentful/contentful-cli/tree/master/docs/space/accesstoken/list',
  'Copyright 2018 Contentful, this is a BETA release'
].join('\n')

export const builder = (yargs) => {
  return yargs
    .usage('Usage: contentful space accesstoken list')
    .epilog(epilog)
}

export const aliases = ['ls']

async function accessTokenList (argv) {
  await assertLoggedIn()
  await assertSpaceIdProvided(argv)
  const { spaceId } = await normalizer(argv)
  const { cmaToken } = await getContext()

  const client = await createManagementClient({
    accessToken: cmaToken
  })

  const space = await client.getSpace(spaceId)
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
