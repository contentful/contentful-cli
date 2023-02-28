const nixt = require('nixt')
const { join } = require('path')
import { createSimpleSpace, replaceCopyrightYear } from '../../util'
const { readFile, writeFile } = require('fs/promises')
const { homedir } = require('os')
const { resolve } = require('path')

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

let space = null

beforeAll(async () => {
  space = await createSimpleSpace('Space Delete')
})

test('should print help message', done => {
  app()
    .run('space delete --help')
    .code(0)
    .expect(result => {
      const text = result.stdout.trim()
      const resultText = replaceCopyrightYear(text)
      expect(resultText).toMatchSnapshot('space delete')
    })
    .end(done)
})

test('should print help message and exit 1 when no args', done => {
  app()
    .run('space delete')
    .code(1)
    .expect(result => {
      const text = result.stderr.trim()
      const resultText = replaceCopyrightYear(text)
      expect(resultText).toMatchSnapshot('space delete')
    })
    .end(done)
})

test('should exit 1 when no args, even with activeSpaceId set', done => {
  // Add and remove property activeSpaceId and activeEnvironmentId to
  // .contentfulrc.json for only this test:
  const configFilePath = resolve(homedir(), '.contentfulrc.json')
  let configContents = null
  function before() {
    readFile(configFilePath)
      .then(contentBuffer => {
        configContents = JSON.parse(contentBuffer)
        return writeFile(
          configFilePath,
          JSON.stringify(
            {
              ...configContents,
              activeSpaceId: space.sys.id,
              activeEnvironmentId: 'master'
            },
            null,
            2
          )
        )
      })
      .catch(err => {
        new Error(
          `Could not create sample .contentfulrc.json with activeSpaceId property ${err}`
        )
      })
  }
  function after() {
    return writeFile(configFilePath, JSON.stringify(configContents))
  }
  app()
    .before(before)
    .run('space delete')
    .expect(result => {
      const regex = /Missing required argument: space-id/
      expect(result.stderr.trim()).toMatch(regex)
    })
    .code(1)
    .after(after)
    .end(done)
})

test('should delete space', done => {
  app()
    .run(`space delete --space-id ${space.sys.id} --yes`)
    .expect(result => {
      const regex = /space was successfully deleted/
      expect(result.stdout.trim()).toMatch(regex)
    })
    .code(0)
    .end(done)
})
