const https = require('https')
const http = require('http')
const net = require('net')
const httpProxy = require('http-proxy')
const url = require('url')
const { readFileSync } = require('fs')
const { resolve } = require('path')

function options(ssl = false) {
  if (!ssl) {
    return {}
  }

  return {
    key: readFileSync(resolve(__dirname, 'certs/localhost.key')).toString(),
    cert: readFileSync(resolve(__dirname, 'certs/localhost.crt')).toString()
  }
}

function onConnection(req, socket) {
  console.log('Receiving reverse proxy request for:' + req.url)

  const serverUrl = url.parse('https://' + req.url)

  const srvSocket = net.connect(serverUrl.port, serverUrl.hostname, function() {
    socket.write(
      'HTTP/1.1 200 Connection Established\r\n' +
        'Proxy-agent: Node-Proxy\r\n' +
        '\r\n'
    )
    srvSocket.pipe(socket)
    socket.pipe(srvSocket)
  })
}

const handler = (resolve, reject) => err => {
  if (err) {
    return reject(err)
  }

  resolve()
}

function collectRequestURLs() {
  const calls = []

  return {
    collect: req => calls.push(req.url),
    getCalls: () => calls
  }
}

function createServer({ ssl: createHttpsProxy } = {}) {
  const transport = createHttpsProxy ? https : http
  const additionalConfig = options(createHttpsProxy)
  const proxyConfig = Object.assign({ prependPath: false }, additionalConfig)
  const proxy = httpProxy.createServer(proxyConfig)

  proxy.on('error', e => {
    console.log('ERROR')
    console.log(e)
  })

  function onRequest(req, res) {
    console.log('Receiving reverse proxy request for:' + req.url)

    proxy.web(req, res, { target: req.url })
  }

  const transportArgs = createHttpsProxy ? [options, onRequest] : [onRequest]
  const server = transport.createServer(...transportArgs)

  const { collect, getCalls } = collectRequestURLs()

  server.on('connect', collect)
  server.on('connect', onConnection)

  const start = (port = 8213) => {
    return new Promise((resolve, reject) => {
      server.listen(port, handler(resolve, reject))
    })
  }

  const stop = () => {
    return new Promise((resolve, reject) => {
      server.close(handler(resolve, reject))
    })
  }

  return { start, stop, getCalls }
}

module.exports = createServer
