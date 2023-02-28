const nixt = require('nixt')
const { join } = require('path')
import {
  createSimpleSpace,
  expectedDir,
  replaceCopyrightYear
} from '../../util'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true, showDiff: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

let space = null

beforeAll(async () => {
  space = await createSimpleSpace('Space Import')
})

test('should print help message', done => {
  app()
    .run('space import --help')
    .code(0)
    .expect(result => {
      const text = result.stdout.trim()
      const resultText = replaceCopyrightYear(text)
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should exit 1 when no args', done => {
  app()
    .run('space import')
    .code(1)
    .expect(result => {
      const text = result.stderr.trim()
      const resultText = replaceCopyrightYear(text)
      expect(resultText).toMatchSnapshot(
        'wrong response in case of no args provided'
      )
    })
    .end(done)
})

test('should exit 1 when no space provided', done => {
  app()
    .run(`space import --content-file ${expectedDir}/export-init-space.json`)
    .code(1)
    .stderr(/Error: You need to provide a space/)
    .end(err => {
      expect(err).toBeFalsy()
      done()
    })
})

test('should import space', done => {
  app()
    .run(
      `space import --space-id ${space.sys.id} --content-file ${expectedDir}/export-init-space.json`
    )
    .stdout(/Finished importing all data/)
    .end(done)
}, 30000)
