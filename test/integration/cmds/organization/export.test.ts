import nixt from 'nixt'
import { join } from 'path'
const bin = join(__dirname, './../../../../', 'bin')
const { replaceCopyrightYear } = require('../../util')

const organizationId = process.env.CLI_E2E_ORG_ID
const org = process.env.CLI_E2E_ORG_ID

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

type Result = {
  stderr: string
  stdout: string
}

const cmd = 'organization export'

describe('organization export snapshots', () => {
  test('should print help message', done => {
    app()
      .run(`${cmd} --help`)
      .code(0)
      .expect(result => {
        const text = result.stdout.trim()
        const resultText = replaceCopyrightYear(text)
        expect(resultText).toMatchSnapshot('help data is correct')
      })
      .end(done)
  })
  it('should exit 1 when no args', done => {
    app()
      .run(`${cmd}`)
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()

        expect(resultText).toContain('Usage: contentful organization export')
      })
      .end(done)
  })
  it('should exit 1 when no organization id passed or in context', done => {
    app()
      .run(`${cmd} --header 'Authorization'`)
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain(
          'Missing required argument: organization-id'
        )
      })
      .end(done)
  })
  it('should return concepts / concepts scheme', done => {
    app()
      .run(`${cmd} --organization-id ${organizationId} --save-file=false`)
      .code(0)
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()

        expect(resultText).toContain('Exporting Concepts')
        expect(resultText).toContain('Exporting Concepts')
        expect(resultText).toContain('Exporting Concept Schemes')
        expect(resultText).toContain('Organization data exported to')
        expect(resultText).toContain('concepts')
        expect(resultText).toContain('conceptSchemes')
      })
      .end(done)
  })
  it('should suppress any log output when silent is true', done => {
    app()
      .run(`${cmd} --organization-id ${organizationId} --silent=true`)
      .code(0)
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()

        expect(resultText).not.toContain('Exporting Concepts')
        expect(resultText).not.toContain('Exporting Concepts')
        expect(resultText).not.toContain('Exporting Concept Schemes')
        expect(resultText).not.toContain('Organization data exported to')
        expect(resultText).not.toContain('concepts')
        expect(resultText).not.toContain('conceptSchemes')
      })
      .end(done)
  })
})
