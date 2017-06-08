import test from 'ava'
import nixt from 'nixt'
import { resolve, join } from 'path'
import { homedir } from 'os'
import { readFile } from 'mz/fs'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test.cb('Should save the correct proxy to ~/.contentfulrc.json', (t) => {
  const expectedConfig = {
    host: 'localhost',
    port: 8080,
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
          t.deepEqual(config.proxy, expectedConfig)
          t.end()
        })
    })
})
