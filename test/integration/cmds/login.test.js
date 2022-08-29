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
    .stdout(/Looks like you already stored a management token on your system\./)
    .stdout(/Your management token:/)
    .stdout(/Maybe you want to contentful logout\?/)
    .end(done)
})

test('should login with management-token flag', done => {
  app()
    .run(`login --management-token ${process.env.CLI_E2E_CMA_TOKEN}`)
    .code(0)
    .stdout(/Great! Your CMA token is now stored on your system\./)
    .stdout(/You can always run contentful logout to remove it\./)
    .end(done)
})
