import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  deleteSpaces,
  createSimpleSpace
} from '../../../util'

const bin = join(__dirname, './../../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

const org = process.env.CLI_E2E_ORG_ID
let space = null

test.before('ensure config file exist and create space', async () => {
  await initConfig()
  space = await createSimpleSpace(org)
})

test.after.always('remove created spaces', t => {
  return deleteSpaces([space.sys.id])
})

test.cb('should exit 1 when no args', t => {
  app()
    .run('space environment create')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should print help message', t => {
  app()
    .run('space environment create --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should create environment with id and name provided', t => {
  app()
    .run(`space environment create --space-id ${space.sys.id} --environment-id staging --name Staging`)
    .expect((result) => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText)
    })
    .code(0)
    .end(t.end)
})

test.cb('should create environment using shortcuts args', t => {
  app()
    .run(`space environment create -s ${space.sys.id} -e shortcutenvironment -n shortcutEnvironment`)
    .stdout(/Successfully created environment shortcutEnvironment \(shortcutenvironment\)/)
    .code(0)
    .end(t.end)
})
