import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig
} from '../util'

const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

beforeAll(() => {
  return initConfig()
})

test('should be already loged in', done => {
  app()
    .run('login')
    .code(0)
    .stdout(/Looks like you already stored a management token on your system\./)
    .stdout(/Your management token:/)
    .stdout(/Maybe you want to contentful logout\?/)
    .end(done)
})
