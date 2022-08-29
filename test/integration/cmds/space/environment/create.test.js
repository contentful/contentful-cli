const nixt = require('nixt')
const { join } = require('path')
const { createSimpleSpace } = require('../../../util')

const bin = join(__dirname, './../../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}
let space = null

beforeAll(async () => {
  space = await createSimpleSpace('Space Env Create')
})

test('should exit 1 when no args', done => {
  app()
    .run('space environment create')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should print help message', done => {
  app()
    .run('space environment create --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should create environment with id and name provided', done => {
  app()
    .run(
      `space environment create --space-id ${space.sys.id} --environment-id staging --name Staging`
    )
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot()
    })
    .code(0)
    .end(done)
})

test('should create environment using shortcuts args', done => {
  app()
    .run(
      `space environment create -s ${space.sys.id} -e shortcutenvironment -n shortcutEnvironment`
    )
    .stdout(
      /Successfully created environment shortcutEnvironment \(shortcutenvironment\)/
    )
    .code(0)
    .end(done)
})
