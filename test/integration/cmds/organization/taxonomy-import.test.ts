import nixt from 'nixt'
import { join } from 'path'
const bin = join(__dirname, './../../../../', 'bin')
import { createClient, PlainClientAPI } from 'contentful-management'

const organizationId = process.env.CLI_E2E_ORG_ID
const accessToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN || ''

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

type Result = {
  stderr: string
  stdout: string
}

const cmd = 'organization export'

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

  test(`should create concepts and scheme if doesn't exist`, done => {
    app()
      .run(`${cmd} --organization-id ${organizationId}`)
      .expect(async ({ stdout }: Result) => {
        const resultText = stdout.trim()
        console.log(resultText)
      })
      .end(async () => {
        done()
      })
  })

  // test(`should update concept and scheme`, done => {
  //   app()
  //     .run(
  //       `${cmd} --organization-id ${organizationId} --content-file ../test/integration/cmds/organization/example-taxonomy-update.json`
  //     )
  //     .expect(async ({ stdout }: Result) => {
  //       const resultText = stdout.trim()

  //       expect(resultText).toContain('Create concepts')
  //       expect(resultText).toContain('Add concept relations')
  //       expect(resultText).toContain('Create concept schemes')
  //     })
  //     .end(async () => {
  //       const [concept0, scheme0] = await Promise.all([
  //         cmaClient.concept.get({
  //           conceptId: 'concept0',
  //           organizationId
  //         }),
  //         cmaClient.conceptScheme.get({
  //           conceptSchemeId: 'scheme0',
  //           organizationId
  //         })
  //       ])

  //       expect(concept0.prefLabel['en-US']).toContain('Updated Animals')
  //       expect(scheme0.prefLabel['en-US']).toContain('Updated Scheme')

  //       done()
  //     })
  // })
})
