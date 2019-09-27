const { createClient } = require('contentful-management')
const HttpsProxyAgent = require('https-proxy-agent')
const { ssl, space, token } = require('yargs').argv

const envKeys = ['http_proxy', 'https_proxy']
envKeys.forEach(envKey => {
  delete process.env[envKey]
  delete process.env[envKey.toUpperCase()]
})

const proxyConfig = {
  host: 'localhost',
  port: 8213
}

if (ssl) {
  Object.assign(proxyConfig, {
    protocol: 'https',
    rejectUnauthorized: false
  })
}

const agent = new HttpsProxyAgent(proxyConfig)

const client = createClient({
  accessToken: token,
  httpsAgent: agent
})

client
  .getSpace(space)
  .then(space => {
    space.getEntries().then(console.log)
  })
  .catch(console.error)
