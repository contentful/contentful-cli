import url from 'url'
import http, { Server } from 'http'
import EventEmitter from 'events'
const HTTP_LISTENER_PORT = process.env.HTTP_LISTENER_PORT || 2013

export const emitter = new EventEmitter()

/**
 * Creates a server and emits query params when receiving GET http requests to http://localhost:2013
 * ```
 * listener('token')
 * emitter.on('token', (params) => { const token = params.get('paramName')})
 * ```
 * @params eventName - event name to be emitted
 * @returns Server
 */
export const listener = (eventName: string): Server =>
  http
    .createServer((req, res) => {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000 // 30 days
      }

      if (['GET'].includes(req.method as string)) {
        const urlQuery = url.parse(req.url || '').query as string
        const params = new URLSearchParams(urlQuery)
        emitter.emit(eventName, params)
        res.writeHead(200, headers)
        res.end(`${eventName} received.`)
        return
      }

      res.writeHead(405, headers)
      res.end(`${req.method} is not allowed for the request.`)
    })
    .listen(HTTP_LISTENER_PORT)
