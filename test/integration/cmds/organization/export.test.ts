import nixt from 'nixt'
import { join } from 'path'
const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

type Result = {
  stderr: string
  stdout: string
}

const cmd = 'organization export'

describe.only('organization export snapshots', () => {
  it('shows the help properly', done => {
    app()
      .run(`${cmd} --help`)
      .code(0)
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()
        expect(resultText).toMatchSnapshot('help data is incorrect')
      })
      .end(done)
  })

  it('should exit 1 when no args', done => {
    app()
      .run(`${cmd}`)
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Usage: organization export')
      })
      .end(done)
  })

  it('should exit 1 when no organization id passed or in context', done => {
    app()
      .run(`${cmd} --header 'Authorization`)
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain(
          'Error: You need to provide a organization id'
        )
      })
      .end(done)
  })
})
