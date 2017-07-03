import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig
} from '../util'

const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: false }).cwd(bin).base('./contentful.js ').clone()
}

test.before('ensure config file exist', () => {
  return initConfig()
})

test.cb('should not logout', t => {
  app()
    .run('logout')
    .on(/Do you want to log out now\?/).respond('n\n')
    .stdout(/Do you want to log out now\? No/)
    .stdout(/Log out aborted by user\./)
    .code(0)
    .end(t.end)
})

test.todo('should successfully logout')

test.todo('[logged-out] should exit when not logged in')
