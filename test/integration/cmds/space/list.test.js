import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  read,
  deleteSpaces,
  createSimpleSpace,
  expectedDir
} from '../../util'

const bin = join(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

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

test.cb('should print help message', t => {
  app()
    .run('space list --help')
    .code(0)
    .expect((result) => {
      const resultText = result.stdout.trim()
      const expected = read(`${expectedDir}/info/space/list.md`)
      t.is(resultText, expected, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should list created space', t => {
  app()
    .run('space list')
    .code(0)
    .stdout(/(Space name)|(Space id)/)
    .stdout(RegExp(space.sys.id))
    .stdout(RegExp(space.name))
    .end(t.end)
})
