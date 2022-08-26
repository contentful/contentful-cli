const nixt = require('nixt')
const { join } = require('path')
const { initConfig } = require('../../util')
import { createTestSpace, initClient } from '@contentful/integration-test-utils'

const bin = join(__dirname, './../../../../', 'bin')
const organizationId = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

const client = initClient()

let space = null

beforeAll(() => {
  return initConfig()
})
beforeAll(async () => {
  space = await createTestSpace({
    client,
    repo: 'CLI',
    organizationId,
    testSuiteName: 'Spaces list'
  })
})
afterAll(() => {
  if (space) return space.delete()
}, 10000)

test('should print help message', done => {
  app()
    .run('space list --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should list created space', done => {
  app()
    .run('space list')
    .code(0)
    .stdout(/(Space name)|(Space id)/)
    .stdout(RegExp(space.sys.id))
    .stdout(RegExp(space.name))
    .end(done)
})
