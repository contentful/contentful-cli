import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import { expectedDir, read } from '../../util'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test.cb.failing('should print help message', t => {
  app()
    .run('space --help')
    .code(0)
    .expect((result) => {
      const resultText = result.stdout.trim()
      const expected = read(`${expectedDir}/info/space/help.md`)
      t.is(resultText, expected, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb.failing('should print help message when no command provided', t => {
  app()
    .run('space')
    .code(1)
    .expect((result) => {
      const resultText = result.stderr.trim()
      var expected = read(`${expectedDir}/info/space/help.md`)
      expected += '\n\nPlease specify a sub command.'
      t.is(resultText, expected, 'wrong response in case of no command provided')
    })
    .end(t.end)
})

test.cb.failing('should print help message on shortcut', t => {
  app()
    .run('space -h')
    .code(0)
    .expect((result) => {
      const resultText = result.stdout.trim()
      const expected = read(`${expectedDir}/info/space/help.md`)
      t.is(resultText, expected, 'help data is incorrect')
    })
    .end(t.end)
})
