import {
  createClient,
  PlainClientAPI,
  ClientAPI,
  ClientOptions
} from 'contentful-management'
import { version } from '../../package.json'
import { getContext } from '../context'
import { agentFromProxy } from './proxy'

// Extending ClientOptions type but making specific adjustments for compatibility
type ClientParams = Omit<ClientOptions, 'apiAdapter' | 'accessToken'> & {
  accessToken?: string | (() => Promise<string>)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiAdapter?: any // Using any here to match how the original JS file behaved
}

export async function createManagementClient(
  params: ClientParams
): Promise<ClientAPI> {
  params.application = `contentful.cli/${version}`

  const context = await getContext()
  const { rawProxy, proxy, host, insecure } = context

  const proxyConfig: Record<string, unknown> = {}
  if (!rawProxy) {
    const { httpsAgent } = agentFromProxy(proxy)
    proxyConfig.httpsAgent = httpsAgent
  } else {
    proxyConfig.proxy = proxy
  }

  return createClient({
    ...params,
    ...proxyConfig,
    host,
    insecure
  } as ClientOptions)
}

export async function createPlainClient(
  params: ClientParams,
  defaults: Record<string, unknown> = {}
): Promise<PlainClientAPI> {
  params.application = `contentful.cli/${version}`

  const context = await getContext()
  const { rawProxy, proxy, host, insecure } = context

  const proxyConfig: Record<string, unknown> = {}
  if (!rawProxy) {
    const { httpsAgent } = agentFromProxy(proxy)
    proxyConfig.httpsAgent = httpsAgent
  } else {
    proxyConfig.proxy = proxy
  }

  return createClient(
    {
      ...params,
      ...proxyConfig,
      host,
      insecure
    } as ClientOptions,
    { type: 'plain', defaults }
  ) as PlainClientAPI
}
