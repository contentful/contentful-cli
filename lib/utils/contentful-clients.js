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

module.exports.createManagementClient = createManagementClient
