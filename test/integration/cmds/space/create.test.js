import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  deleteSpaces,
  extractSpaceId,
  expectedDir,
  read
} from '../../util'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

var spacesToDelete = []

test.before('ensure config file exist', () => {
  return initConfig()
})

test.after.always('remove created spaces', t => {
  return deleteSpaces(spacesToDelete)
})

test.cb.failing('should exit 1 when no args', t => {
  app()
    .run('space create')
    .code(1)
    .expect((result) => {
      const resultText = result.stderr.trim()
      var expected = read(`${expectedDir}/info/space/create.md`)
      expected += '\n\nMissing required argument: name'
      t.is(resultText, expected, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb.failing('should print help message', t => {
  app()
    .run('space create --help')
    .code(0)
    .expect((result) => {
      const resultText = result.stdout.trim()
      const expected = read(`${expectedDir}/info/space/create.md`)
      t.is(resultText, expected, 'help data is incorrect')
    })
    .end(t.end)
})

test.todo('should create space with no org provided')

test.cb('should create space with name and org provided', t => {
  app()
    .run(`space create --name cli_test_org_space --organization-id ${process.env.ORG_ID}`)
    .expect((result) => {
      const resultText = result.stdout.trim()
      var spaceId = extractSpaceId(resultText)
      spacesToDelete.push(spaceId)
      const regex = /Successfully created space cli_test_org_space/
      t.regex(result.stdout.trim(), regex)
    })
    .code(0)
    .end(t.end)
})

test.cb('should create space using shortcuts args', t => {
  app()
    .run(`space create -n cli_test_org_space_sh --org ${process.env.ORG_ID}`)
    .expect((result) => {
      const resultText = result.stdout.trim()
      var spaceId = extractSpaceId(resultText)
      spacesToDelete.push(spaceId)
      const regex = /Successfully created space cli_test_org_space_sh/
      t.regex(result.stdout.trim(), regex)
    })
    .code(0)
    .end(t.end)
})
