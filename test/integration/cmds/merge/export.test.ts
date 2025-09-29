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

describe('merge export snapshots', () => {
  it('shows the help properly', done => {
    app()
      .run('merge export --help')
      .code(0)
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()
        expect(resultText).toMatchSnapshot('help data is incorrect')
      })
      .end(done)
  })
})

describe('merge export command args validation', () => {
  it('should exit 1 when no args', done => {
    app()
      .run('merge export')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Usage: contentful merge export')
      })
      .end(done)
  })

  it('should exit 1 when no source environment', done => {
    app()
      .run('merge export --te target')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Usage: contentful merge export')
      })
      .end(done)
  })

  it('should exit 1 when no target environment', done => {
    app()
      .run('merge export --se source')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Usage: contentful merge export')
      })
      .end(done)
  })

  it('should exit 1 when no space id passed or in context', done => {
    app()
      .run('merge export --se source --te source')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Error: You need to provide a space id')
      })
      .end(done)
  })

  it('should exit 1 when source and target are the same', done => {
    app()
      .run('merge export --se source --te source --space-id space')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain(
          'Source and target environments cannot be the same.'
        )
      })
      .end(done)
  })
})

describe('merge exports outputs the diff between two envs', () => {
  jest.setTimeout(90000)
  it('runs correctly', done => {
    app()
      .run('merge export --se master --te beta --space-id t7gnd9bsbzjy')
      .code(0)
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()
        expect(resultText).toContain('Migration exported to')
      })
      .end(done)
  })
})
