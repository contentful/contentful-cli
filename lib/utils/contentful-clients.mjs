import contentfulManagement from 'contentful-management'
import packageConfig from '../../package.json' assert { type: 'json' }
import { getContext } from '../context.mjs'
import { agentFromProxy } from './proxy.mjs'

export async function createManagementClient(params) {
  params.application = `contentful.cli/${packageConfig.version}`

  const context = await getContext()
  const { rawProxy, proxy, host, insecure } = context

  const proxyConfig = {}
  if (!rawProxy) {
    const { httpsAgent } = agentFromProxy(proxy)
    proxyConfig.httpsAgent = httpsAgent
  } else {
    proxyConfig.proxy = proxy
  }

  return contentfulManagement.createClient({
    ...params,
    ...proxyConfig,
    host,
    insecure
  })
}
