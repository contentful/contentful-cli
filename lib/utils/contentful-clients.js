import { createClient } from 'contentful-management'
import { version } from '../../package.json'
import { getContext } from '../context'
import { agentFromProxy } from './proxy'

export async function createManagementClient (params) {
  params.application = `contentful.cli/${version}`

  const context = await getContext()
  const { proxy, host = 'api.contentful.com' } = context
  const { httpsAgent } = agentFromProxy(proxy)

  return createClient({ ...params, httpsAgent, host })
}
