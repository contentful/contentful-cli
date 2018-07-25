import test from 'ava'
import nixt from 'nixt'
import { resolve } from 'path'

const bin = resolve(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test.cb('should print help message', t => {
  app()
    .run('extension delete --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should exit 1 when no args given except space id', t => {
  app()
    .run('extension delete')
    .code(1)
    .expect((result) => {
      const regex = /Missing required argument:\s+id/
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.serial.cb('should exit 1 when everything required is given except space id', t => {
  app()
    .run('extension delete --id some-id')
    .code(1)
    .expect((result) => {
      const regex = /You need to provide a space id./
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})
