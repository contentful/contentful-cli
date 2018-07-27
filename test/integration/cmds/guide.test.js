import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  deleteSpaces
} from '../util'

const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

const spacesToDelete = []
test.before('ensure config file exist', () => {
  return initConfig()
})

test.after.always('remove created spaces', t => {
  return deleteSpaces(spacesToDelete)
})

test.cb('should be already loged in', t => {
  app()
    .run('guide')
    // step 2 createSpace
    .on(/Create your new Space now?/)
    .respond('\n')
    .expect(({stdout}) => {
      const matches = /Successfully created space .+ \((.+)\)/.exec(stdout)
      if (!matches) {
        return new Error('Can\'t extract space id')
      }
      spacesToDelete.push(matches[1])
    })
    // step 3 seedContent

    .expect(console.log)
    // .code(0)
    // .stdout(/Looks like you already stored a CMA token on your system\./)
    // .stdout(/Your CMA token:/)
    // .stdout(/Maybe you want to contentful logout\?/)
    .end(t.end)
})
