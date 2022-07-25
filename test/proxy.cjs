const talkback = require('talkback')

const bodyMatcher = (tape, req) => {
  if (tape.meta.tag === 'create-space') {
    const tapeBody = JSON.parse(tape.req.body.toString())
    const reqBody = JSON.parse(req.body.toString())
    return tapeBody.name === reqBody.name
  }
  return true
}

const opts = {
  host: '',
  port: 3333,
  path: './recordings',
  bodyMatcher,
  ignoreHeaders: [
    'x-contentful-user-agent',
    'authorization',
    'user-agent',
    'content-length',
    'accept-encoding',
    'connection'
  ]
}
const server = talkback(opts)
server.start(() => console.log(`Talkback Started.`))
// server.close()
