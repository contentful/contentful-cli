const nixt = require('nixt')
const { join } = require('path')
import { replaceCopyrightYear } from '../../util'

const bin = join(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test('should print help message', done => {
  app()
    .run('organization list --help')
    .code(0)
    .expect(result => {
      const text = result.stdout.trim()
      const resultText = replaceCopyrightYear(text)
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should list organizations', done => {
  app()
    .run('organization list')
    .code(0)
    .stdout(/(Organization name)|(Organization id)/)
    .stdout(RegExp(org))
    .stdout(/Contentful CLI Test Org/)
    .end(done)
})
