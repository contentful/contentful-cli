import { parse, format } from 'url'
import { toInteger } from 'lodash'
import { HttpsProxyAgent } from 'https-proxy-agent'

interface Auth {
  username?: string
  password?: string
}

interface ProxyObject {
  host: string
  port: number
  auth?: Auth
  isHttps?: boolean
}

function serializeAuth({ username, password }: Auth = {}): string {
  if (!username) {
    return ''
  }

  if (!password) {
    return username
  }

  return `${username}:${password}`
}

function parseAuth(authString: string | null): Auth {
  // authString may be a falsy value like `null`
  const [username, password] = (authString || '').split(':')
  return { username, password }
}

export function proxyStringToObject(proxyString: string): ProxyObject {
  if (!proxyString.startsWith('http')) {
    return proxyStringToObject(`http://${proxyString}`)
  }

  const {
    hostname,
    port: portString,
    auth: authString,
    protocol
  } = parse(proxyString)

  const auth = parseAuth(authString)
  const port = toInteger(portString)
  const isHttps = protocol === 'https:'
  const host = hostname || ''

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

export function proxyObjectToString(proxyObject: ProxyObject): string {
  if (typeof proxyObject !== 'object' || proxyObject.constructor !== Object) {
    throw new Error('Object required')
  }
  const { host: hostname, port, auth: authObject, isHttps } = proxyObject
  const auth = serializeAuth(authObject)
  const protocol = isHttps ? 'https' : 'http'

  const formatted = format({
    protocol,
    hostname,
    port,
    auth
  })

  // Ugly fix for Node 6 vs Node 8 behavior
  return formatted.replace(/^\/\//, '')
}

export function agentFromProxy(proxy: ProxyObject | null): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  httpsAgent?: any
} {
  if (!proxy) {
    return {}
  }

  const { host, port } = proxy
  // HttpsProxyAgent expects a URL string
  const proxyUrl = `http://${host}:${port}`
  const httpsAgent = new HttpsProxyAgent(proxyUrl)
  return { httpsAgent }
}
