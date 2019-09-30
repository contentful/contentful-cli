const nixt = require('nixt')
const { join } = require('path')
const { initConfig } = require('../util')

const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: false })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

beforeAll(() => {
  return initConfig()
})

test('should not logout', done => {
  app()
    .run('logout')
    .on(/Do you want to log out now\?/)
    .respond('n\n')
    .stdout(/Log out aborted by user\./)
    .code(0)
    .end(done)
})
