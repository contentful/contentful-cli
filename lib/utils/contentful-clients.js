import fs from 'fs'
import cma from 'contentful-management'
import { getContext } from '../context.mjs'
import { agentFromProxy } from './proxy.mjs'
const packageConfig = JSON.parse(fs.readFileSync('./package.json'))

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

  return cma.createClient({
    ...params,
    ...proxyConfig,
    host,
    insecure
  })
}
