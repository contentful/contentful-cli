import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  // deleteSpaces,
  createSimpleSpace,
  expectedDir
} from '../../util'

const bin = join(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true, showDiff: true }).cwd(bin).base('./contentful.js ').clone()
}

var space = null
var spacesToDelete = []

beforeAll(() => {
  return initConfig()
})
beforeAll(async () => {
  space = await createSimpleSpace(org)
  spacesToDelete.push(space.sys.id)
})
// afterAll(() => {
//   // return deleteSpaces(spacesToDelete)
// })

test('should print help message', done => {
  app()
    .run('space import --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should exit 1 when no args', done => {
  app()
    .run('space import')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('wrong response in case of no args provided')
    })
    .end(done)
})

test('should exit 1 when no space provided', done => {
  app()
    .run(`space import --content-file ${expectedDir}/export-init-space.json`)
    .code(1)
    .stderr(/Error: You need to provide a space/)
    .end((err) => {
      expect(err).toBeFalsy()
      done()
    })
})

test.skip('should import space', done => {
  app()
    .run(`space import --space-id ${space.sys.id} --content-file ${expectedDir}/export-init-space.json`)
    .stdout(/Finished importing all data/)
    .end(done)
}, 30000)
