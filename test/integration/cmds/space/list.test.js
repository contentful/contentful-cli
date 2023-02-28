const nixt = require('nixt')
const { join } = require('path')
import { createSimpleSpace, replaceCopyrightYear } from '../../util'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

let space = null

beforeAll(async () => {
  space = await createSimpleSpace('List Spaces')
})

test('should print help message', done => {
  app()
    .run('space list --help')
    .code(0)
    .expect(result => {
      const text = result.stdout.trim()
      const resultText = replaceCopyrightYear(text)
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
