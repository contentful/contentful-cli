import test from 'ava'
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

test.before('ensure config file exist', () => {
  return initConfig()
})

test.before('create fresh space', async t => {
  space = await createSimpleSpace(org)
  environment = await space.getEnvironment('master')
  spacesToDelete.push(space.sys.id)
})

test.after.always('remove created spaces', t => {
  return deleteSpaces(spacesToDelete)
})

test.cb('should be able to create, update and delete a extension', t => {
  const newSrc = 'https://new-src.example.com'

  function createExtension () {
    app()
      .run(`extension create --space-id ${space.sys.id} --descriptor ${configPath} --src '${newSrc}'`)
      .expect((result) => {
        console.log(result.stdout)
        console.log(result.stderr)
        t.regex(result.stdout.trim(), /Successfully created extension:/)
        t.regex(result.stdout.trim(), /ID.+sample-extension/)
      })
      .code(0)
      .end(() => {
        environment.getUiExtensions()
          .then((result) => {
            if (!result.items.length) {
              t.fail('No extensions found while the sample one should show up')
              t.end()
              return
            }
            t.is(result.items[0].sys.id, 'sample-extension')
            t.is(result.items[0].extension.src, newSrc)
          })
          .catch((error) => {
            console.error(error)
            t.fail()
            t.end()
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
        t.regex(result.stdout.trim(), /Successfully updated extension:/)
        t.regex(result.stdout.trim(), /ID.+sample-extension/)
      })
      .code(0)
      .end(() => {
        space.getUiExtensions()
          .then((result) => {
            if (!result.items.length) {
              t.fail('No extensions found while the sample one should show up')
              return
            }
            t.is(result.items[0].sys.id, 'sample-extension')
            t.is(result.items[0].extension.srcdoc, '<h1>Sample Extension Content</h1>\n')
          })
          .catch((error) => {
            console.error(error)
            t.fail()
            t.end()
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
        t.regex(result.stdout.trim(), /Successfully deleted extension with ID sample-extension/)
      })
      .code(0)
      .end(() => {
        environment.getUiExtensions()
          .then((result) => {
            if (!result.items.length) {
              t.pass()
              t.end()
              return
            }
            t.fail('Extension was not deleted')
          })
          .catch((error) => {
            console.error(error)
            t.fail()
            t.end()
          })
          .then(t.end)
      })
  }

  createExtension()
})
