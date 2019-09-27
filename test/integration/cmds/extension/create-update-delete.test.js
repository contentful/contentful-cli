const nixt = require('nixt')
const { resolve } = require('path')
const { initConfig, createSimpleSpace, deleteSpaces } = require('../../util')

const bin = resolve(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

const configPath = resolve(__dirname, 'fixtures', 'sample-extension.json')
const srcDocPath = resolve(__dirname, 'fixtures', 'sample-extension.html')

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

let space = null
let environment = null
let spacesToDelete = []

beforeAll(() => {
  return initConfig()
})

beforeAll(async () => {
  space = await createSimpleSpace(org, 'ext-crud')
  environment = await space.getEnvironment('master')
  spacesToDelete.push(space.sys.id)
})

afterAll(() => {
  return deleteSpaces(spacesToDelete)
})

test('should be able to create, update and delete a extension', done => {
  const newSrc = 'https://new-src.example.com'

  function createExtension() {
    app()
      .run(
        `extension create --space-id ${space.sys.id} --descriptor ${configPath} --src '${newSrc}'`
      )
      .expect(result => {
        console.log(result.stdout)
        console.log(result.stderr)
        expect(result.stdout.trim()).toMatch(/Successfully created extension:/)
        expect(result.stdout.trim()).toMatch(/ID.+sample-extension/)
      })
      .code(0)
      .end(() => {
        environment
          .getUiExtensions()
          .then(result => {
            if (!result.items.length) {
              throw new Error(
                'No extensions found while the sample one should show up'
              )
            }
            expect(result.items[0].sys.id).toBe('sample-extension')
            expect(result.items[0].extension.src).toBe(newSrc)
          })
          .then(updateExtension)
      })
  }

  function updateExtension() {
    app()
      .run(
        `extension update --version 1 --space-id ${space.sys.id} --descriptor ${configPath} --srcdoc '${srcDocPath}'`
      )
      .expect(result => {
        console.log(result.stdout)
        console.log(result.stderr)
        expect(result.stdout.trim()).toMatch(/Successfully updated extension:/)
        expect(result.stdout.trim()).toMatch(/ID.+sample-extension/)
      })
      .code(0)
      .end(deleteExtension)
  }

  function deleteExtension() {
    app()
      .run(
        `extension delete --id sample-extension --space-id ${space.sys.id} --version 1`
      )
      .expect(result => {
        console.log(result.stdout)
        console.log(result.stderr)
        expect(result.stdout.trim()).toMatch(
          /Successfully deleted extension with ID sample-extension/
        )
      })
      .code(0)
      .end(done)
  }

  createExtension()
}, 20000)
