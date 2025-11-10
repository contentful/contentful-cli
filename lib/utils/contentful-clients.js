const { createClient } = require('contentful-management')
const { version } = require('../../package.json')
const { getContext } = require('../context')
const { agentFromProxy } = require('./proxy')

async function createManagementClient(params) {
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

  return createClient({ ...params, ...proxyConfig, host, insecure })
}

async function createPlainClient(params, defaults = {}) {
  const context = await getContext()
  const { rawProxy, proxy, host: contextHost, insecure } = context

  const proxyConfig = {}
  if (!rawProxy) {
    const { httpsAgent } = agentFromProxy(proxy)
    proxyConfig.httpsAgent = httpsAgent
  } else {
    proxyConfig.proxy = proxy
  }

  // Added this to ensure that the host is set correctly, currently we rely on a json file that sets it, this allows us to migrate and pass a flag if set for the migrate option
  const effectiveHost = params.host || contextHost || 'api.contentful.com'
  // Log the final host for debugging purposes if not api.contentful.com
  if (effectiveHost !== 'api.contentful.com') {
    console.log(`Overriding default host with: ${effectiveHost}`)
  }
  return createClient(
    {
      ...params,
      ...proxyConfig,
      host: effectiveHost,
      insecure,
      application: `contentful.cli/${version}`
    },
    { type: 'plain', defaults }
  )
}

module.exports = { createManagementClient, createPlainClient }
