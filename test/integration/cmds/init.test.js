const nixt = require('nixt')
const { join } = require('path')

const bin = join(__dirname, './../../../', 'bin')

const app = () =>
  nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()

test('init: should print greeting message', done => {
  app()
    .run('init')
    .stdout(/Welcome to Contentful/)
    // Skip the list prompt, as it makes the test hangs, it seems fine if it's a string prompt
    .on(/Do you want to create a new space or use an existing one?/)
    .respond('\n')
    .end(done)
})
