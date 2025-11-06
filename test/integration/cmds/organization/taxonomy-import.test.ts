import nixt from 'nixt'
import { join } from 'path'
const bin = join(__dirname, './../../../../', 'bin')
import { createClient, PlainClientAPI } from 'contentful-management'

// Increase timeout for potentially slower network + retries
jest.setTimeout(60000)

const organizationId = process.env.CLI_E2E_ORG_ID
const accessToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN || ''

if (!organizationId) {
  throw new Error('Missing CLI_E2E_ORG_ID env var required for taxonomy import integration tests')
}

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

type Result = {
  stderr: string
  stdout: string
}

const cmd = 'organization import'

let cmaClient: PlainClientAPI
describe('organization import', () => {
  beforeAll(async () => {
    cmaClient = createClient({ accessToken }, { type: 'plain' })
  })
  afterAll(async () => {
    await Promise.allSettled([
      cmaClient.conceptScheme.delete({
        organizationId,
        conceptSchemeId: 'scheme0',
        version: 2
      }),
      cmaClient.concept.delete({
        organizationId,
        conceptId: 'concept2',
        version: 1
      }),
      cmaClient.concept.delete({
        organizationId,
        conceptId: 'concept1',
        version: 2
      }),
      cmaClient.concept.delete({
        organizationId,
        conceptId: 'concept0',
        version: 3
      })
    ])
  })

  test('should print help message', done => {
    app()
      .run(`${cmd} --help`)
      .code(0)
      .expect(result => {
        const text = result.stdout.trim()
        expect(text).toMatchSnapshot('organization import help data is correct')
      })
      .end(done)
  })

  test('should print help message when correct arguments are not provided', done => {
    app()
      .run(`${cmd}`)
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()

        expect(resultText).toContain('Usage: contentful organization import')
      })
      .end(done)
  })

  test(`should create concepts and scheme if doesn't exist`, done => {
    app()
      .run(
        `${cmd} --organization-id ${organizationId} --content-file ../test/integration/cmds/organization/example-taxonomy.json`
      )
      .expect(async ({ stdout }: Result) => {
        const resultText = stdout.trim()

        expect(resultText).toContain('Create concepts')
        expect(resultText).toContain('Add concept relations')
        expect(resultText).toContain('Create concept schemes')
      })
      .end(async () => {
        const [concept0, concept1, concept2, scheme0] = await Promise.all([
          cmaClient.concept.get({
            conceptId: 'concept0',
            organizationId
          }),
          cmaClient.concept.get({
            conceptId: 'concept1',
            organizationId
          }),
          cmaClient.concept.get({
            conceptId: 'concept2',
            organizationId
          }),
          cmaClient.conceptScheme.get({
            conceptSchemeId: 'scheme0',
            organizationId
          })
        ])

        expect(concept0.prefLabel['en-US']).toContain('Animals')
        expect(concept1.prefLabel['en-US']).toContain('Primates')
        expect(concept2.prefLabel['en-US']).toContain('Plants')
        expect(scheme0.prefLabel['en-US']).toContain('Scheme')

        expect(concept1.broader[0].sys.id).toContain(concept0.sys.id)
        expect(concept0.related[0].sys.id).toContain(concept2.sys.id)
        expect(concept2.related[0].sys.id).toContain(concept0.sys.id)

        done()
      })
  })

  test(`should update concept and scheme`, done => {
    app()
      .run(
        `${cmd} --organization-id ${organizationId} --content-file ../test/integration/cmds/organization/example-taxonomy-update.json`
      )
      .expect(async ({ stdout }: Result) => {
        const resultText = stdout.trim()

        expect(resultText).toContain('Create concepts')
        expect(resultText).toContain('Add concept relations')
        expect(resultText).toContain('Create concept schemes')
      })
      .end(async () => {
        const [concept0, scheme0] = await Promise.all([
          cmaClient.concept.get({
            conceptId: 'concept0',
            organizationId
          }),
          cmaClient.conceptScheme.get({
            conceptSchemeId: 'scheme0',
            organizationId
          })
        ])

        expect(concept0.prefLabel['en-US']).toContain('Updated Animals')
        expect(scheme0.prefLabel['en-US']).toContain('Updated Scheme')

        done()
      })
  })
})
