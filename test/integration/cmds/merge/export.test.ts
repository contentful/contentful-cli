const execa = require('execa')
import { join } from 'path'

const bin = join(__dirname, './../../../../', 'bin')
const contentfulPath = join(bin, 'contentful.js')

const runCommand = async (args: string) => {
  const argArray = args.split(' ').filter(arg => arg.length > 0)
  return await execa('node', [contentfulPath, ...argArray], {
    cwd: bin,
    reject: false
  })
}

type Result = {
  stderr: string
  stdout: string
  exitCode: number
}

describe('merge export snapshots', () => {
  it('shows the help properly', async () => {
    const result = await runCommand('merge export --help')
    expect(result.exitCode).toBe(0)
    const resultText = result.stdout.trim()
    expect(resultText).toMatchSnapshot('help data is incorrect')
  })
})

describe('merge export command args validation', () => {
  it('should exit 1 when no args', async () => {
    const result = await runCommand('merge export')
    expect(result.exitCode).toBe(1)
    const resultText = result.stderr.trim()
    expect(resultText).toContain('Usage: contentful merge export')
  })

  it('should exit 1 when no source environment', async () => {
    const result = await runCommand('merge export --te target')
    expect(result.exitCode).toBe(1)
    const resultText = result.stderr.trim()
    expect(resultText).toContain('Usage: contentful merge export')
  })

  it('should exit 1 when no target environment', async () => {
    const result = await runCommand('merge export --se source')
    expect(result.exitCode).toBe(1)
    const resultText = result.stderr.trim()
    expect(resultText).toContain('Usage: contentful merge export')
  })

  it('should exit 1 when no space id passed or in context', async () => {
    const result = await runCommand('merge export --se source --te source')
    expect(result.exitCode).toBe(1)
    const resultText = result.stderr.trim()
    expect(resultText).toContain('Error: You need to provide a space id')
  })

  it('should exit 1 when source and target are the same', async () => {
    const result = await runCommand('merge export --se source --te source --space-id space')
    expect(result.exitCode).toBe(1)
    const resultText = result.stderr.trim()
    expect(resultText).toContain(
      'Source and target environments cannot be the same.'
    )
  })
})

describe('space list command', () => {
  it('should get the space id', async () => {
    const spaces = await runCommand('space list')
    const spaceList = spaces.stdout.trim()
    expect(spaceList).toBe('t7gnd9bsbzjy')
  })
})

describe('merge exports outputs the diff between two envs', () => {
  jest.setTimeout(60000)
  it('runs correctly', async () => {
    const result = await runCommand('merge export --se master --te beta --space-id t7gnd9bsbzjy')
    expect(result.exitCode).toBe(0)
    const resultText = result.stdout.trim()
    expect(resultText).toContain('Migration exported to')
  })
})
