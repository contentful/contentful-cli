const { parse, format } = require('url')
const { toInteger } = require('lodash')
const HttpsProxyAgent = require('https-proxy-agent')

function serializeAuth({ username, password } = {}) {
  if (!username) {
    return ''
  }

  if (!password) {
    return username
  }

  return `${username}:${password}`
}

function parseAuth(authString) {
  // authString may be a falsy value like `null`
  const [username, password] = (authString || '').split(':')
  return { username, password }
}

function proxyStringToObject(proxyString) {
  if (!proxyString.startsWith('http')) {
    return proxyStringToObject(`http://${proxyString}`)
  }

  const {
    hostname: host,
    port: portString,
    auth: authString,
    protocol
  } = parse(proxyString)

  const auth = parseAuth(authString)
  const port = toInteger(portString)
  const isHttps = protocol === 'https:'

  if (!auth.username) {
    return { host, port, isHttps }
  }

  return {
    host,
    port,
    auth,
    isHttps
  }
}

module.exports.proxyStringToObject = proxyStringToObject

function proxyObjectToString(proxyObject) {
  if (typeof proxyObject !== 'object' || proxyObject.constructor !== Object) {
    throw new Error('Object required')
  }
  const { host: hostname, port, auth: authObject, isHttps } = proxyObject
  const auth = serializeAuth(authObject)
  const protocol = isHttps ? 'https' : 'http'

  const formatted = format({ protocol, hostname, port, auth })

  // Ugly fix for Node 6 vs Node 8 behavior
  return formatted.replace(/^\/\//, '')
}

module.exports.proxyObjectToString = proxyObjectToString

function agentFromProxy(proxy) {
  if (!proxy) {
    return {}
  }

  const { host, port } = proxy
  const httpsAgent = new HttpsProxyAgent({ host, port })
  return { httpsAgent }
}

module.exports.agentFromProxy = agentFromProxy
