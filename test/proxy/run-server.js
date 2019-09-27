const createServer = require('./server')
const { ssl } = require('yargs').argv

const server = createServer({ ssl })

server.start().then(() => console.log('listening'))
