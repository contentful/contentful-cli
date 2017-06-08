import { toInteger } from 'lodash'

export function proxyStringToObject (proxyString) {
  let proxyObject = null
  const chunks = proxyString.split('@')
  if (chunks.length > 1) {
    // Advanced proxy config with auth credentials
    const auth = chunks[0].split(':')
    const host = chunks[1].split(':')
    proxyObject = {
      host: host[0],
      port: toInteger(host[1]),
      auth: {
        username: auth[0],
        password: auth[1]
      }
    }
  } else {
    // Simple proxy config without auth credentials
    const host = chunks[0].split(':')
    proxyObject = {
      host: host[0],
      port: toInteger(host[1])
    }
  }
  return proxyObject
}

export function proxyObjectToString (proxyObject) {
  const host = `${proxyObject.host}:${proxyObject.port}`
  const auth = proxyObject.auth ? `${proxyObject.auth.username}:${proxyObject.auth.password}@` : ''
  return `${auth}${host}`
}
