import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  deleteSpaces,
  createSimpleSpace,
  expectedDir
} from '../../util'

const bin = join(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true, showDiff: true }).cwd(bin).base('./contentful.js ').clone()
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
    .run('space import --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should exit 1 when no args', t => {
  app()
    .run('space import')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      t.snapshot(resultText, 'wrong response in case of no args provided')
    })
    .end(t.end)
})

test.cb('should exit 1 when no space provided', t => {
  app()
    .run(`space import --content-file ${expectedDir}/export-init-space.json`)
    .code(1)
    .stderr(/Error: You need to provide a space/)
    .end((err) => {
      t.ifError(err, 'error message or error code is incorrect')
      t.end()
    })
})

test.cb('should import space', t => {
  app()
    .run(`space import --space-id ${space.sys.id} --content-file ${expectedDir}/export-init-space.json`)
    .stdout(/Finished importing all data/)
    .end(t.end)
})
