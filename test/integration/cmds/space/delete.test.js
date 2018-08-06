import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  createSimpleSpace
} from '../../util'

const bin = join(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

var space = null

test.before('ensure config file exist', () => {
  return initConfig()
})
test.before('create fresh space', async t => {
  space = await createSimpleSpace(org)
})

test.cb('should exit 1 when no args', t => {
  app()
    .run('space delete')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should print help message', t => {
  app()
    .run('space delete --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should delete space', t => {
  app()
    .run(`space delete --space-id ${space.sys.id} --yes`)
    .expect((result) => {
      const regex = /space was successfully deleted/
      t.regex(result.stdout.trim(), regex)
    })
    .code(0)
    .end(t.end)
})
