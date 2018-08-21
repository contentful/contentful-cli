const talkback = require('talkback')

const opts = {
  port: 3333,
  ignoreHeaders: [
    'x-contentful-user-agent', 'authorization', 'user-agent'
  ]
}
const server = talkback(opts)
server.start(() => console.log('Talkback Started'))
// server.close()
