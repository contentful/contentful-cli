import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  deleteSpaces,
  extractSpaceId
} from '../../util'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

var spacesToDelete = []

beforeAll(() => {
  return initConfig()
})

afterAll(() => {
  return deleteSpaces(spacesToDelete)
}, 10000)

test('should exit 1 when no args', done => {
  app()
    .run('space create')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(() => {
      done()
    })
})

test('should print help message', done => {
  app()
    .run('space create --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should create space', done => {
  app()
    .run(`space create --name cli_test_org_space --organization-id ${process.env.CLI_E2E_ORG_ID}`)
    .expect((result) => {
      const resultText = result.stdout.trim()
      var spaceId = extractSpaceId(resultText)
      spacesToDelete.push(spaceId)
      const regex = /Successfully created space .*/ // name doesn't matter because response is replayed
      expect(result.stdout.trim()).toMatch(regex)
    })
    .code(0)
    .end(done)
})

test('should create space using shortcuts args', done => {
  app()
    .run(`space create -n cli_test_org_space_sh --org ${process.env.CLI_E2E_ORG_ID}`)
    .expect((result) => {
      const resultText = result.stdout.trim()
      var spaceId = extractSpaceId(resultText)
      spacesToDelete.push(spaceId)
      const regex = /Successfully created space .*/ // name doesn't matter because response is replayed
      expect(result.stdout.trim()).toMatch(regex)
    })
    .code(0)
    .end(done)
})
