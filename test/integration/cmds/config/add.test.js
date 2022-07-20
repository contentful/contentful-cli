const nixt = require('nixt')
const fs = require('fs')
const { join } = require('path')

const bin = join(__dirname, './../../../../', 'bin')
const TMP_CONFIG_FILE = join(
  fs.mkdtempSync('/tmp/add.test'),
  '.contentfulrc.json'
)

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.mjs').clone()
}

test('config add throws error when option as is empty', done => {
  app()
    .run('config add --as')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('Not enough arguments following: as')
    })
    .end(done)
})

test('config add throws error when option mt is empty', done => {
  app()
    .run('config add --mt')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('Not enough arguments following: mt')
    })
    .end(done)
})

test('config add allows insecure', done => {
  app()
    .env('CONTENTFUL_CONFIG_FILE', TMP_CONFIG_FILE)
    .run('config add --insecure=true')
    .unlink(TMP_CONFIG_FILE)
    .code(0)
    .end(done)
})

test('config add throws error when option ae is empty', done => {
  app()
    .run('config add --ae')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('Not enough arguments following: ae')
    })
    .end(done)
})
