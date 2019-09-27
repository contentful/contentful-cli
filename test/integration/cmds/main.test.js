const nixt = require('nixt')
const { join } = require('path')

const packageVersion = require('../../../package.json').version
const bin = join(__dirname, './../../../', 'bin')

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

test('should return code 1 when errors exist no args', done => {
  app()
    .run('')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should print help message', done => {
  app()
    .run('--help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should print help message on shortcut', done => {
  app()
    .run('-h')
    .code(0)
    .stdout(/Usage: contentful <cmd> \[args\]/)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should print help message on wrong subcommand', done => {
  app()
    .run('lolbar')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should print version number', done => {
  app()
    .run('--version')
    .code(0)
    .stdout(packageVersion)
    .end(err => {
      expect(err).toBeFalsy()
      done()
    })
})
