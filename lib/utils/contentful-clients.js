import { createClient } from 'contentful-management'
import { version } from '../../package.json'
import { getContext } from '../context'
import { agentFromProxy } from './proxy'

export async function createManagementClient (params) {
  params.application = `contentful.cli/${version}`

  const context = await getContext()
  const { rawProxy, proxy, host = 'api.contentful.com' } = context

  const proxyConfig = {}
  if (!rawProxy) {
    const { httpsAgent } = agentFromProxy(proxy)
    proxyConfig.httpsAgent = httpsAgent
  } else {
    proxyConfig.proxy = proxy
  }

  return createClient({ ...params, ...proxyConfig, host })
}
