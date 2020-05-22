const nixt = require('nixt')
const { join } = require('path')
const { readFileSync } = require('fs')
const removeHandler = require('../../../../lib/cmds/config_cmds/remove')

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
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

test('config add allows insecure', (done) => {
  app()
    .run('config add --insecure=true')
    .code(0)
    .end(() => {
      let context = {}
      try {
        context = readFileSync('.contentfulrc.json')
      } catch (err) {
        console.warn(err)
      }
      return removeHandler({ context, insecure: true }).then(done)
    })
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
