import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test.cb('should print help message', t => {
  app()
    .run('space --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should print help message when no command provided', t => {
  app()
    .run('space')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      t.snapshot(resultText, 'wrong response in case of no command provided')
    })
    .end(t.end)
})

test.cb('should print help message on shortcut', t => {
  app()
    .run('space -h')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})
