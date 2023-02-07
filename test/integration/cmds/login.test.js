const nixt = require('nixt')
const { join } = require('path')

const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test('should be already logged in', done => {
  app()
    .run('login')
    .code(0)
    .stdout(/You're already logged in!/)
    .stdout(/Your management token:/)
    .end(done)
})

test('should login with management-token flag', done => {
  app()
    .run(
      `login --management-token ${process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN}`
    )
    .code(0)
    .stdout(/Great! You've successfully logged in!/)
    .end(done)
})
