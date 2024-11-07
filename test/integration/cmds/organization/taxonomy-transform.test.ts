import { readFileSync } from 'fs'
import nixt from 'nixt'
import { join } from 'path'
const bin = join(__dirname, './../../../../', 'bin')

const organizationId = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

type Result = {
  stderr: string
  stdout: string
}

const cmd = 'organization taxonomy-transform'

describe('organization taxonomy-transform', () => {
  test('should print help message', done => {
    app()
      .run(`${cmd} --help`)
      .code(0)
      .expect(result => {
        const text = result.stdout.trim()
        expect(text).toMatchSnapshot('taxonomy-transform help data is correct')
      })
      .end(done)
  })

  it('should exit 1 when no args', done => {
    app()
      .run(`${cmd}`)
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()

        expect(resultText).toContain(
          'Usage: contentful organization taxonomy-transform'
        )
      })
      .end(done)
  })

  test('should return transformed concepts / concepts scheme', done => {
    app()
      .run(
        `${cmd} --organization-id ${organizationId} -t ../test/integration/cmds/organization/example-load.js --save-file false`
      )
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()

        expect(resultText).toContain('Exporting Concepts')
        expect(resultText).toContain('Exporting Concept Schemes')
        expect(resultText).toContain('Running transform script')
        expect(resultText).toContain('concepts')
        expect(resultText).toContain('conceptSchemes')
      })
      .end(done)
  })

  it('should suppress any log output when silent is true', done => {
    app()
      .run(
        `${cmd} --organization-id ${organizationId} -t ../test/integration/cmds/organization/example-load.js --silent -o output.json`
      )
      .code(0)
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()

        expect(resultText).not.toContain('Exporting Concepts')
        expect(resultText).not.toContain('Exporting Concept Schemes')
        expect(resultText).not.toContain('Running transform script')
        expect(resultText).not.toContain('concepts')
        expect(resultText).not.toContain('conceptSchemes')

        const transformedData = readFileSync(
          join(__dirname, './../../../../bin/', 'output.json'),
          'utf8'
        )
        expect(transformedData).toMatchSnapshot('transformed data is correct')
      })
      .end(done)
  })
})
