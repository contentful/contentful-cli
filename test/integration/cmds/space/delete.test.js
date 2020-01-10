const nixt = require('nixt')
const { join } = require('path')
const { initConfig, createSimpleSpace } = require('../../util')
const { readFile, writeFile } = require('mz/fs')
const { homedir } = require('os')
const { resolve } = require('path')

const bin = join(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

var space = null

beforeAll(() => {
  return initConfig()
})
beforeAll(async () => {
  space = await createSimpleSpace(org, 'space-delete')
})

test('should print help message', done => {
  app()
    .run('space delete --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should exit 1 when no args', done => {
  app()
    .run('space delete')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should exit 1 when no args, even with activeSpaceId set', async done => {
  // Add and remove options activeSpaceId and activeEnvironmentId to
  // .contentfulrc.json for only this test:
  const configFilePath = resolve(homedir(), '.contentfulrc.json')
  let configContents = null
  async function before() {
    try {
      let configContentsBuffer = await readFile(configFilePath)
      configContents = JSON.parse(configContentsBuffer)
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
    } catch (e) {
      throw Error(e)
    }
  }
  async function after() {
    return writeFile(configFilePath, configContents)
  }
  app()
    .before(before)
    .run(`space delete --yes`)
    .expect(result => {
      const regex = /space was successfully deleted/
      expect(result.stdout.trim()).not.toMatch(regex)
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
