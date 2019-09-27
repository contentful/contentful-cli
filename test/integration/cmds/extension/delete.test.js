const nixt = require('nixt')
const { resolve } = require('path')

const bin = resolve(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

test('should print help message', done => {
  app()
    .run('extension delete --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should exit 1 when no args given except space id', done => {
  app()
    .run('extension delete')
    .code(1)
    .expect(result => {
      const regex = /Missing required argument:\s+id/
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})
