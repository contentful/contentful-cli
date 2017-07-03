import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import { expectedDir, read } from '../util'

const packageVersion = require('../../../package.json').version
const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test.cb('should return code 1 when errors exist no args', t => {
  app()
    .run('')
    .code(1)
    .expect((result) => {
      const resultText = result.stderr.trim()
      var expected = read(`${expectedDir}/info/help.md`)
      expected += '\n\nPlease specify a command.'
      t.is(resultText, expected, 'wrong response in case of no args provided')
    })
    .end(t.end)
})

test.cb('should print help message', t => {
  app()
    .run('--help')
    .code(0)
    .expect((result) => {
      const resultText = result.stdout.trim()
      const expected = read(`${expectedDir}/info/help.md`)
      t.is(resultText, expected, 'help data or error code is incorrect')
    })
    .end(t.end)
})

test.cb('should print help message on shortcut', t => {
  app()
    .run('-h')
    .code(0)
    .stdout(/Usage: contentful <cmd> \[args\]/)
    .expect((result) => {
      const resultText = result.stdout.trim()
      const expected = read(`${expectedDir}/info/help.md`)
      t.is(resultText, expected, 'help data or error code is incorrect')
    })
    .end(t.end)
})

test.cb('should print help message on wrong subcommand', t => {
  app()
    .run('lolbar')
    .code(1)
    .expect((result) => {
      const resultText = result.stderr.trim()
      var expected = read(`${expectedDir}/info/help.md`)
      expected += '\n\nPlease specify a command.'
      t.is(resultText, expected, 'help data or error code is incorrect')
    })
    .end(t.end)
})

test.cb('should print version number', t => {
  app()
    .run('--version')
    .code(0)
    .stdout(packageVersion)
    .end((err) => {
      t.ifError(err, 'wrong version number or response message')
      t.end()
    })
})
