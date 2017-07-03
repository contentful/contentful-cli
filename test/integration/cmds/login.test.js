import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig
} from '../util'

const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test.before('ensure config file exist', () => {
  return initConfig()
})

test.cb('should be already loged in', t => {
  app()
    .run('login')
    .code(0)
    .stdout(/Looks like you already stored a CMA token on your system\./)
    .stdout(/Your CMA token:/)
    .stdout(/Maybe you want to contentful logout\?/)
    .end(t.end)
})

test.todo('[logged-out] should successfully login')
