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

test.cb('should create, list and delete environment', t => {
  function createEnvironment () {
    app()
      .run(`space environment create --space-id ${space.sys.id} --environment-id createListDelete --name "Create List Delete"`)
      .expect((result) => {
        const resultText = result.stdout.trim()
        t.snapshot(resultText)
      })
      .code(0)
      .end(listEnvironments)
  }

  function listEnvironments () {
    app()
      .run(`space environment list --space-id ${space.sys.id}`)
      .stdout(/Environment name +|/)
      .stdout(/Environment id +|/)
      .stdout(/Create List Delete +|/)
      .stdout(/master +|/)
      .code(0)
      .end(deleteEnvironment)
  }

  function deleteEnvironment () {
    app()
      .run(`space environment delete --space-id ${space.sys.id} --environment-id createListDelete`)
      .stdout(/Environment name +|/)
      .stdout(/Environment id +|/)
      .stdout(/Create List Delete +|/)
      .stdout(/master +|/)
      .code(0)
      .end(t.end)
  }

  createEnvironment()
})
