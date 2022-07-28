import cma from 'contentful-management'
import { getContext } from '../context.js'
import { agentFromProxy } from './proxy.js'
import { version } from '../../package.json'

export async function createManagementClient(params) {
  params.application = `contentful.cli/${version}`

  const context = await getContext()
  const { rawProxy, proxy, host, insecure } = context

  const proxyConfig = {}
  if (!rawProxy) {
    const { httpsAgent } = agentFromProxy(proxy)
    proxyConfig.httpsAgent = httpsAgent
  } else {
    proxyConfig.proxy = proxy
  }

  return cma.createClient({
    ...params,
    ...proxyConfig,
    host,
    insecure
  })
}
