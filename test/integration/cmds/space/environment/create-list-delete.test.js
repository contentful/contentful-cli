const nixt = require('nixt')
const { join } = require('path')
const { createSimpleSpace } = require('../../../util')

const bin = join(__dirname, './../../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

let space = null

beforeAll(async () => {
  space = await createSimpleSpace('Space Env')
})

test('should create, list and delete environment', done => {
  function createEnvironment() {
    app()
      .run(
        `space environment create --space-id ${space.sys.id} --environment-id createListDelete --name "Create List Delete"`
      )
      .expect(result => {
        const resultText = result.stdout.trim()
        expect(resultText).toMatchSnapshot()
      })
      .code(0)
      .end(listEnvironments)
  }

  function listEnvironments() {
    app()
      .run(`space environment list --space-id ${space.sys.id}`)
      .stdout(/Environment name +|/)
      .stdout(/Environment id +|/)
      .stdout(/Create List Delete +|/)
      .stdout(/master +|/)
      .code(0)
      .end(deleteEnvironment)
  }

  function deleteEnvironment() {
    app()
      .run(
        `space environment delete --space-id ${space.sys.id} --environment-id createListDelete`
      )
      .stdout(/Environment name +|/)
      .stdout(/Environment id +|/)
      .stdout(/Create List Delete +|/)
      .stdout(/master +|/)
      .code(0)
      .end(done)
  }

  createEnvironment()
}, 10000)
