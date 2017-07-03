import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
    initConfig,
  deleteSpaces,
  expectedDir,
  createSimpleSpace,
  read
} from '../../util'

const bin = join(__dirname, './../../../../', 'bin')
const org = process.env.ORG_ID

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

var space = null
var spacesToDelete = []

test.before('ensure config file exist', () => {
  return initConfig()
})
test.before('create fresh space', async t => {
  space = await createSimpleSpace(org)
  spacesToDelete.push(space.sys.id)
})
test.after.always('remove created spaces', t => {
  return deleteSpaces(spacesToDelete)
})

test.cb('should exit when no space provided', t => {
  app()
    .run(`space patch`)
    .code(0)
    .stderr(/Error: You need to provide a space/)
    .end((err) => {
      t.ifError(err, 'error message or error code is incorrect')
      t.end()
    })
})

test.cb.failing('should print help message', t => {
  app()
    .run('space patch --help')
    .code(0)
    .expect((result) => {
      const resultText = result.stdout.trim()
      var expected = read(`${expectedDir}/info/space/patch.md`)
      expected = expected.replace(/%CWD%/g, bin)
      t.is(resultText, expected, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should exit when no patch dir provided', t => {
  app()
    .run(`space patch --space-id ${space.sys.id}`)
    .code(0)
    .stderr(/No Contentful patch files provided/)
    .end((err) => {
      t.ifError(err, 'error message or error code is incorrect')
      t.end()
    })
})

test.cb('should exit when non existing patch dir provided', t => {
  app()
    .run(`space patch --space-id ${space.sys.id} --patch-dir lol`)
    .code(0)
    .stderr(/no such file/)
    .end((err) => {
      t.ifError(err, 'error message or error code is incorrect')
      t.end()
    })
})
