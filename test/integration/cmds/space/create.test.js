const nixt = require('nixt')
const { join } = require('path')
const { initConfig, deleteSpaces, extractSpaceId } = require('../../util')

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
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
    .run(
      `space create --name cli_test_org_space --organization-id ${process.env.CLI_E2E_ORG_ID}`
    )
    .on(/Do you want to confirm the space creation?/)
    .respond('\n')
    .expect(result => {
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
    .run(
      `space create -n cli_test_org_space_sh --org ${process.env.CLI_E2E_ORG_ID}`
    )
    .on(/Do you want to confirm the space creation?/)
    .respond('\n')
    .expect(result => {
      const resultText = result.stdout.trim()
      var spaceId = extractSpaceId(resultText)
      spacesToDelete.push(spaceId)
      const regex = /Successfully created space .*/ // name doesn't matter because response is replayed
      expect(result.stdout.trim()).toMatch(regex)
    })
    .code(0)
    .end(done)
})

test('should should abort space creation when answering no', done => {
  app()
    .run(
      `space create --name cli_test_org_space --organization-id ${process.env.CLI_E2E_ORG_ID}`
    )
    .on(/Do you want to confirm the space creation?/)
    .respond('n\n')
    .expect(result => {
      const resultText = result.stdout.trim()
      const regex = /Space creation aborted.*/ // name doesn't matter because response is replayed
      expect(resultText).toMatch(regex)
    })
    .code(1)
    .end(done)
})

test('should should skip prompt when --yes is set', done => {
  app()
    .run(
      `space create --name cli_test_org_space --yes --organization-id ${process.env.CLI_E2E_ORG_ID}`
    )
    .expect(result => {
      const resultText = result.stdout.trim()
      var spaceId = extractSpaceId(resultText)
      spacesToDelete.push(spaceId)
      const regex = /Successfully created space .*/ // name doesn't matter because response is replayed
      expect(result.stdout.trim()).toMatch(regex)
    })
    .code(0)
    .end(done)
})
