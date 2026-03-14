import {output, outputOptions} from '../../../lib/utils/output'

// Mock log from utils/log
jest.mock('../../../lib/utils/log', () => ({
  log: jest.fn()
}))

// Mock toTOON from utils/toon
jest.mock('../../../lib/utils/toon', () => ({
  toTOON: jest.fn((data: unknown) => `TOON:${JSON.stringify(data)}`)
}))

import {log} from '../../../lib/utils/log'
import {toTOON} from '../../../lib/utils/toon'

const mockLog = log as jest.MockedFunction<typeof log>
const mockToTOON = toTOON as jest.MockedFunction<typeof toTOON>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('output()', () => {
  const sampleData = {items: [{id: 'abc'}, {id: 'def'}]}

  describe('JSON mode', () => {
    it('logs JSON.stringify output when json flag is true', () => {
      output(sampleData, {json: true}, {})
      expect(mockLog).toHaveBeenCalledTimes(1)
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(sampleData, null, 2))
    })

    it('does not call toTOON when json flag is true', () => {
      output(sampleData, {json: true}, {})
      expect(mockToTOON).not.toHaveBeenCalled()
    })
  })

  describe('agent mode', () => {
    it('logs TOON-encoded output when agentMode flag is true', () => {
      output(sampleData, {agentMode: true}, {})
      expect(mockToTOON).toHaveBeenCalledWith(sampleData)
      expect(mockLog).toHaveBeenCalledTimes(1)
      expect(mockLog).toHaveBeenCalledWith(`TOON:${JSON.stringify(sampleData)}`)
    })
  })

  describe('quiet mode', () => {
    it('logs each extracted ID on its own line when quiet and extractor are provided', () => {
      const quietExtractor = (d: any) => d.items.map((i: any) => i.id)
      output(sampleData, {quiet: true}, {quietExtractor})
      expect(mockLog).toHaveBeenCalledTimes(2)
      expect(mockLog).toHaveBeenNthCalledWith(1, 'abc')
      expect(mockLog).toHaveBeenNthCalledWith(2, 'def')
    })

    it('falls through to table mode when quiet is true but no extractor is provided', () => {
      const tableConfig = {head: ['ID'], rows: [['123']]}
      output(sampleData, {quiet: true}, {table: tableConfig})
      // table.toString() is called, log is still invoked once
      expect(mockLog).toHaveBeenCalledTimes(1)
      // Should not log individual IDs
      expect(mockLog).not.toHaveBeenCalledWith('abc')
    })

    it('falls through to fallback JSON when quiet is true and no extractor or table', () => {
      output(sampleData, {quiet: true}, {})
      expect(mockLog).toHaveBeenCalledTimes(1)
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(sampleData, null, 2))
    })
  })

  describe('table mode', () => {
    it('logs a table string when table config is provided', () => {
      const tableConfig = {head: ['ID', 'Name'], rows: [['123', 'Test']]}
      output(sampleData, {}, {table: tableConfig})
      expect(mockLog).toHaveBeenCalledTimes(1)
      const loggedValue = mockLog.mock.calls[0][0]
      expect(typeof loggedValue).toBe('string')
      // cli-table3 renders headers and rows into an ASCII table
      expect(loggedValue).toContain('ID')
      expect(loggedValue).toContain('Name')
      expect(loggedValue).toContain('123')
      expect(loggedValue).toContain('Test')
    })
  })

  describe('key-value mode', () => {
    it('logs a key-value table string when keyValue config is provided', () => {
      const keyValueConfig = {rows: [['Name', 'my-space']] as [string, string][]}
      output(sampleData, {}, {keyValue: keyValueConfig})
      expect(mockLog).toHaveBeenCalledTimes(1)
      const loggedValue = mockLog.mock.calls[0][0]
      expect(typeof loggedValue).toBe('string')
      expect(loggedValue).toContain('Name')
      expect(loggedValue).toContain('my-space')
    })

    it('logs multiple key-value rows', () => {
      const keyValueConfig = {
        rows: [
          ['ID', 'abc123'],
          ['Status', 'active']
        ] as [string, string][]
      }
      output(sampleData, {}, {keyValue: keyValueConfig})
      expect(mockLog).toHaveBeenCalledTimes(1)
      const loggedValue = mockLog.mock.calls[0][0]
      expect(loggedValue).toContain('abc123')
      expect(loggedValue).toContain('active')
    })
  })

  describe('fallback', () => {
    it('logs JSON when no flags and no options are set', () => {
      output(sampleData, {}, {})
      expect(mockLog).toHaveBeenCalledTimes(1)
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(sampleData, null, 2))
    })

    it('works with primitive data in fallback', () => {
      output(42, {}, {})
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(42, null, 2))
    })
  })

  describe('flag priority', () => {
    it('json takes precedence over agentMode', () => {
      output(sampleData, {json: true, agentMode: true}, {})
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(sampleData, null, 2))
      expect(mockToTOON).not.toHaveBeenCalled()
    })

    it('json takes precedence over quiet', () => {
      const quietExtractor = (d: any) => d.items.map((i: any) => i.id)
      output(sampleData, {json: true, quiet: true}, {quietExtractor})
      expect(mockLog).toHaveBeenCalledTimes(1)
      expect(mockLog).toHaveBeenCalledWith(JSON.stringify(sampleData, null, 2))
    })

    it('agentMode takes precedence over quiet', () => {
      const quietExtractor = (d: any) => d.items.map((i: any) => i.id)
      output(sampleData, {agentMode: true, quiet: true}, {quietExtractor})
      expect(mockToTOON).toHaveBeenCalledWith(sampleData)
      expect(mockLog).toHaveBeenCalledTimes(1)
      // Called with TOON output, not individual IDs
      expect(mockLog).not.toHaveBeenCalledWith('abc')
    })
  })
})

describe('outputOptions()', () => {
  it('adds --json option to yargs', () => {
    const mockOption = jest.fn().mockReturnThis()
    const fakeYargs = {option: mockOption}
    outputOptions(fakeYargs)
    expect(mockOption).toHaveBeenCalledWith(
      'json',
      expect.objectContaining({type: 'boolean'})
    )
  })

  it('adds --agent-mode option to yargs', () => {
    const mockOption = jest.fn().mockReturnThis()
    const fakeYargs = {option: mockOption}
    outputOptions(fakeYargs)
    expect(mockOption).toHaveBeenCalledWith(
      'agent-mode',
      expect.objectContaining({type: 'boolean'})
    )
  })

  it('adds --quiet option with alias -q to yargs', () => {
    const mockOption = jest.fn().mockReturnThis()
    const fakeYargs = {option: mockOption}
    outputOptions(fakeYargs)
    expect(mockOption).toHaveBeenCalledWith(
      'quiet',
      expect.objectContaining({type: 'boolean', alias: 'q'})
    )
  })

  it('returns the yargs instance for chaining', () => {
    const mockOption = jest.fn().mockReturnThis()
    const fakeYargs = {option: mockOption}
    const result = outputOptions(fakeYargs)
    expect(result).toBe(fakeYargs)
  })
})
