import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig
} from '../util'

const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: false }).cwd(bin).base('./contentful.js ').clone()
}

beforeAll('ensure config file exist', () => {
  return initConfig()
})

test('should not logout', done => {
  app()
    .run('logout')
    .on(/Do you want to log out now\?/).respond('n\n')
    .stdout(/Do you want to log out now\? No/)
    .stdout(/Log out aborted by user\./)
    .code(0)
    .end(done)
})

test('TODO: should successfully logout')

test('TODO: [logged-out] should exit when not logged in')
