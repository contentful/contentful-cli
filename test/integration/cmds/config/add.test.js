import nixt from 'nixt'
import { resolve, join } from 'path'
import { homedir } from 'os'
import { readFile } from 'mz/fs'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test('TODO: Refactor that test !')

test.skip('Should save the correct proxy to ~/.contentfulrc.json', done => {
  const expectedConfig = {
    host: 'localhost',
    port: 8080,
    isHttps: false,
    auth: {
      username: 'user',
      password: 'password'
    }
  }
  app()
    .run('config add --proxy user:password@localhost:8080')
    .stdout(/config added successfully/)
    .code(0)
    .end(() => {
      readFile(resolve(homedir(), '.contentfulrc.json'))
        .then(JSON.parse)
        .then((config) => {
          expect(config.proxy).toEqual(expectedConfig)
          done()
        })
    })
})
