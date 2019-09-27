const nixt = require('nixt')
const { resolve } = require('path')

const bin = resolve(__dirname, './../../../../', 'bin')

const configPath = resolve(__dirname, 'fixtures', 'sample-extension.json')

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

test('should print help message', done => {
  app()
    .run('extension update --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should exit 1 when no args given', done => {
  app()
    .run('extension update')
    .code(1)
    .expect(result => {
      const regex = /You need to provide a space id./
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})

test('should exit 1 when only space id is given', done => {
  app()
    .run('extension delete --space-id some-id')
    .code(1)
    .expect(result => {
      const regex = /Missing required argument:\s+id/
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})

test('should exit 1 when only id is given', done => {
  app()
    .run('extension update --space-id some-id --id sample-extension')
    .code(1)
    .expect(result => {
      const regex = /Missing required properties:\s+name/
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})

test('should exit 1 when src and srcdoc are omitted', done => {
  app()
    .run(
      'extension update  --space-id some-id --id sample-extension --name foo --field-types Symbol'
    )
    .code(1)
    .expect(result => {
      const regex = /Error: Must contain exactly one of:\s+src, srcdoc/
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})

test('should exit 1 when descriptor given but src and srcdoc still missing', done => {
  app()
    .run(`extension update --space-id some-id --descriptor ${configPath}`)
    .code(1)
    .expect(result => {
      const regex = /Error: Must contain exactly one of:\s+src, srcdoc/
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})
