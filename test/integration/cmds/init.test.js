const nixt = require('nixt')
const { join } = require('path')

const bin = join(__dirname, './../../../', 'bin')

const app = () =>
  nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()

test('init: should print greeting message', done => {
  app()
    .run('init')
    .code(0)
    .stdout(/Welcome to Contentful/)
    .on(/You are not logged in, continue login in browser?/)
    .respond('n\n')
    .end(done)
})
