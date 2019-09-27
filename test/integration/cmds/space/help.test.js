const nixt = require('nixt')
const { join } = require('path')

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

test('should print help message', done => {
  app()
    .run('space --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should print help message when no command provided', done => {
  app()
    .run('space')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot(
        'wrong response in case of no command provided'
      )
    })
    .end(done)
})

test('should print help message on shortcut', done => {
  app()
    .run('space -h')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})
