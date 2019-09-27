const nixt = require('nixt')
const { join } = require('path')
const { initConfig, deleteSpaces, createSimpleSpace } = require('../../util')

const bin = join(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

var space = null
var spacesToDelete = []

beforeAll(() => {
  return initConfig()
})
beforeAll(async () => {
  space = await createSimpleSpace(org, 'space-list')
  spacesToDelete.push(space.sys.id)
})
afterAll(() => {
  return deleteSpaces(spacesToDelete)
})

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
