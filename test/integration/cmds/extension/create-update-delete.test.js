import nixt from 'nixt'
import { resolve } from 'path'
import {
  initConfig,
  createSimpleSpace,
  deleteSpaces
} from '../../util'

const bin = resolve(__dirname, './../../../../', 'bin')
const org = process.env.CLI_E2E_ORG_ID

const configPath = resolve(__dirname, 'fixtures', 'sample-extension.json')
const srcDocPath = resolve(__dirname, 'fixtures', 'sample-extension.html')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

let space = null
let environment = null
let spacesToDelete = []

beforeAll(() => {
  return initConfig()
})

beforeAll(async () => {
  space = await createSimpleSpace(org)
  environment = await space.getEnvironment('master')
  spacesToDelete.push(space.sys.id)
})

afterAll(() => {
  return deleteSpaces(spacesToDelete)
})

test.skip('should be able to create, update and delete a extension', done => {
  const newSrc = 'https://new-src.example.com'

  function createExtension () {
    app()
      .run(`extension create --space-id ${space.sys.id} --descriptor ${configPath} --src '${newSrc}'`)
      .expect((result) => {
        console.log(result.stdout)
        console.log(result.stderr)
        expect(result.stdout.trim()).toMatch(/Successfully created extension:/)
        expect(result.stdout.trim()).toMatch(/ID.+sample-extension/)
      })
      .code(0)
      .end(() => {
        environment.getUiExtensions()
          .then((result) => {
            if (!result.items.length) {
              done.fail('No extensions found while the sample one should show up')
              done()
              return
            }
            expect(result.items[0].sys.id).toBe('sample-extension')
            expect(result.items[0].extension.src).toBe(newSrc)
          })
          .catch((error) => {
            console.error(error)
            done.fail()
            done()
          })
          .then(updateExtension)
      })
  }

  function updateExtension () {
    app()
      .run(`extension update --version 1 --space-id ${space.sys.id} --descriptor ${configPath} --srcdoc '${srcDocPath}'`)
      .expect((result) => {
        console.log(result.stdout)
        console.log(result.stderr)
        expect(result.stdout.trim()).toMatch(/Successfully updated extension:/)
        expect(result.stdout.trim()).toMatch(/ID.+sample-extension/)
      })
      .code(0)
      .end(() => {
        environment.getUiExtensions() // still gets old version.... hmmm need to force this one to record again
          .then((result) => {
            if (!result.items.length) {
              done.fail('No extensions found while the sample one should show up')
              return
            }
            expect(result.items[0].sys.id).toBe('sample-extension')
            expect(result.items[0].extension.srcdoc).toBe('<h1>Sample Extension Content</h1>\n')
          })
          .catch((error) => {
            console.error(error)
            done.fail()
            done()
          })
          .then(deleteExtension)
      })
  }

  function deleteExtension () {
    app()
      .run(`extension delete --id sample-extension --space-id ${space.sys.id} --version 2`)
      .expect((result) => {
        console.log(result.stdout)
        console.log(result.stderr)
        expect(result.stdout.trim()).toMatch(/Successfully deleted extension with ID sample-extension/)
      })
      .code(0)
      .end(() => {
        environment.getUiExtensions()
          .then((result) => {
            if (!result.items.length) {
              done()
              return
            }
            done.fail('Extension was not deleted')
          })
          .catch((error) => {
            console.error(error)
            done.fail()
            done()
          })
          .then(done)
      })
  }

  createExtension()
}, 20000)
