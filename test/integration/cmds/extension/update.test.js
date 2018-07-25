import test from 'ava'
import nixt from 'nixt'
import { resolve } from 'path'

const bin = resolve(__dirname, './../../../../', 'bin')

const configPath = resolve(__dirname, 'fixtures', 'sample-extension.json')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test.cb('should print help message', t => {
  app()
    .run('extension update --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.serial.cb('should exit 1 when no args given', t => {
  app()
    .run('extension update')
    .code(1)
    .expect((result) => {
      const regex = /You need to provide a space id./
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.cb('should exit 1 when only space id is given', t => {
  app()
    .run('extension delete --space-id some-id')
    .code(1)
    .expect((result) => {
      const regex = /Missing required argument:\s+id/
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.cb('should exit 1 when only id is given', t => {
  app()
    .run('extension update --space-id some-id --id sample-extension')
    .code(1)
    .expect((result) => {
      const regex = /Missing required properties:\s+name, field-types/
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.cb('should exit 1 when src and srcdoc are omitted', t => {
  app()
    .run('extension update  --space-id some-id --id sample-extension --name foo --field-types Symbol')
    .code(1)
    .expect((result) => {
      const regex = /Error: Must contain exactly one of:\s+src, srcdoc/
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.cb('should exit 1 when descriptor given but src and srcdoc still missing', t => {
  app()
    .run(`extension update --space-id some-id --descriptor ${configPath}`)
    .code(1)
    .expect((result) => {
      const regex = /Error: Must contain exactly one of:\s+src, srcdoc/
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})
