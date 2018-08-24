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
}, 10000)

test('should print help message', done => {
  app()
    .run('extension create --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(resultText).toMatchSnapshot('help data is incorrect')
    })
    .end(done)
})

test('should exit 1 when no args given', done => {
  app()
    .run('extension create')
    .code(1)
    .expect((result) => {
      const regex = /You need to provide a space id./
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})

test('should exit 1 everything except space id is given', done => {
  app()
    .run(`extension create --space-id ${space.sys.id}`)
    .code(1)
    .expect((result) => {
      const regex = /Missing required properties:\s+name, field-types/
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})

test('should exit 1 when src and srcdoc are omitted', done => {
  app()
    .run(`extension create --space-id ${space.sys.id} --name foo --field-types Symbol`)
    .code(1)
    .expect((result) => {
      const regex = /Error: Must contain exactly one of:\s+src, srcdoc/
      expect(result.stderr.trim()).toMatch(regex)
    })
    .end(done)
})

test(
  'should exit 1 when descriptor given but src and srcdoc still missing',
  done => {
    app()
      .run(`extension create  --space-id ${space.sys.id} --descriptor ${configPath}`)
      .code(1)
      .expect((result) => {
        const regex = /Error: Must contain exactly one of:\s+src, srcdoc/
        expect(result.stderr.trim()).toMatch(regex)
      })
      .end(done)
  }
)

test('should create extension from config file', done => {
  app()
    .run(`extension create --space-id ${space.sys.id} --descriptor ${configPath} --src 'https://foo.com/sample-extension'`)
    .expect((result) => {
      expect(result.stdout.trim()).toMatch(/Successfully created extension:/)
      expect(result.stdout.trim()).toMatch(/ID.+sample-extension/)
      expect(result.stdout.trim()).toMatch(/Name.+Sample Extension/)
      expect(result.stdout.trim()).toMatch(/Field types.+Symbol, Number/)
      expect(result.stdout.trim()).toMatch(/Src.+https:\/\/foo.com\/sample-extension/)
      expect(result.stdout.trim()).toMatch(/Version.+1/)
    })
    .code(0)
    .end(() => {
      return environment.getUiExtension('sample-extension')
        .then((extension) => {
          if (!extension) {
            done.fail('Extension not found via CMA')
            return
          }
          expect(extension.sys.id).toBe('sample-extension')
          expect(extension.sys.version).toBe(1)
          expect(extension.extension).toEqual({
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
          done.fail()
        })
        .then(done)
    })
}, 10000)

test('should create extension from config file with srcdoc', done => {
  app()
    .run(`extension create --space-id ${space.sys.id} --descriptor ${configPath} --srcdoc '${srcDocPath}' --id some-other-id`)
    .expect((result) => {
      expect(result.stdout.trim()).toMatch(/Successfully created extension:/)
      expect(result.stdout.trim()).toMatch(/ID.+some-other-id/)
      expect(result.stdout.trim()).toMatch(/Name.+Sample Extension/)
      expect(result.stdout.trim()).toMatch(/Field types.+Symbol, Number/)
      expect(result.stdout.trim()).toMatch(/Src.+\[uses srcdoc\]/)
      expect(result.stdout.trim()).toMatch(/Version.+1/)
    })
    .code(0)
    .end(() => {
      return environment.getUiExtensions()
        .then((result) => {
          const extension = result.items.find((item) => item.sys.id === 'some-other-id')
          if (!extension) {
            done.fail('Extension not found via CMA')
            return
          }
          expect(extension.sys.id).toBe('some-other-id')
          expect(extension.sys.version).toBe(1)
          expect(extension.extension).toEqual({
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
          done.fail()
        })
        .then(done)
    })
})
