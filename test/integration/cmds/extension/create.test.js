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

test.cb('should print help message', t => {
  app()
    .run('extension create --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should exit 1 when no args given', t => {
  app()
    .run('extension create')
    .code(1)
    .expect((result) => {
      const regex = /You need to provide a space id./
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.cb('should exit 1 everything except space id is given', t => {
  app()
    .run(`extension create --space-id ${space.sys.id}`)
    .code(1)
    .expect((result) => {
      const regex = /Missing required properties:\s+name, field-types/
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.cb('should exit 1 when src and srcdoc are omitted', t => {
  app()
    .run(`extension create --space-id ${space.sys.id} --name foo --field-types Symbol`)
    .code(1)
    .expect((result) => {
      const regex = /Error: Must contain exactly one of:\s+src, srcdoc/
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.cb('should exit 1 when descriptor given but src and srcdoc still missing', t => {
  app()
    .run(`extension create  --space-id ${space.sys.id} --descriptor ${configPath}`)
    .code(1)
    .expect((result) => {
      const regex = /Error: Must contain exactly one of:\s+src, srcdoc/
      t.regex(result.stderr.trim(), regex)
    })
    .end(t.end)
})

test.cb('should create extension from config file', t => {
  app()
    .run(`extension create --space-id ${space.sys.id} --descriptor ${configPath} --src 'https://foo.com/sample-extension'`)
    .expect((result) => {
      t.regex(result.stdout.trim(), /Successfully created extension:/)
      t.regex(result.stdout.trim(), /ID.+sample-extension/)
      t.regex(result.stdout.trim(), /Name.+Sample Extension/)
      t.regex(result.stdout.trim(), /Field types.+Symbol, Number/)
      t.regex(result.stdout.trim(), /Src.+https:\/\/foo.com\/sample-extension/)
      t.regex(result.stdout.trim(), /Version.+1/)
    })
    .code(0)
    .end(() => {
      return environment.getUiExtensions()
        .then((result) => {
          const extension = result.items.find((item) => item.sys.id === 'sample-extension')
          if (!extension) {
            t.fail('Extension not found via CMA')
            return
          }
          t.is(extension.sys.id, 'sample-extension')
          t.is(extension.sys.version, 1)
          t.deepEqual(extension.extension, {
            name: 'Sample Extension',
            src: 'https://foo.com/sample-extension',
            fieldTypes: [
              {
                type: 'Symbol'
              },
              {
                type: 'Number'
              }
            ]
          })
        })
        .catch((err) => {
          console.error(err)
          t.fail()
        })
        .then(t.end)
    })
})

test.cb('should create extension from config file with srcdoc', t => {
  app()
    .run(`extension create --space-id ${space.sys.id} --descriptor ${configPath} --srcdoc '${srcDocPath}' --id some-other-id`)
    .expect((result) => {
      t.regex(result.stdout.trim(), /Successfully created extension:/)
      t.regex(result.stdout.trim(), /ID.+some-other-id/)
      t.regex(result.stdout.trim(), /Name.+Sample Extension/)
      t.regex(result.stdout.trim(), /Field types.+Symbol, Number/)
      t.regex(result.stdout.trim(), /Src.+\[uses srcdoc\]/)
      t.regex(result.stdout.trim(), /Version.+1/)
    })
    .code(0)
    .end(() => {
      return environment.getUiExtensions()
        .then((result) => {
          const extension = result.items.find((item) => item.sys.id === 'some-other-id')
          if (!extension) {
            t.fail('Extension not found via CMA')
            return
          }
          t.is(extension.sys.id, 'some-other-id')
          t.is(extension.sys.version, 1)
          t.deepEqual(extension.extension, {
            name: 'Sample Extension',
            srcdoc: '<h1>Sample Extension Content</h1>\n',
            fieldTypes: [
              {
                type: 'Symbol'
              },
              {
                type: 'Number'
              }
            ]
          })
        })
        .catch((err) => {
          console.error(err)
          t.fail()
        })
        .then(t.end)
    })
})
