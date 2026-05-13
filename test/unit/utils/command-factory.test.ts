// Mock all external dependencies before imports
jest.mock('../../../lib/utils/contentful-clients', () => ({
  createPlainClient: jest.fn()
}))
jest.mock('../../../lib/utils/headers', () => ({
  getHeadersFromOption: jest.fn(v => v || {})
}))
jest.mock('../../../lib/utils/copyright', () => ({
  copyright: 'Copyright 2026 Contentful'
}))
jest.mock('../../../lib/utils/actions', () => ({
  confirmation: jest.fn()
}))
jest.mock('../../../lib/utils/output', () => ({
  output: jest.fn()
}))
jest.mock('../../../lib/utils/log', () => ({
  log: jest.fn(),
  warning: jest.fn(),
  logError: jest.fn()
}))

import {
  createCommand,
  CommandConfig
} from '../../../lib/utils/command-factory'
import { output } from '../../../lib/utils/output'
import { warning, logError } from '../../../lib/utils/log'

const { createPlainClient } = require('../../../lib/utils/contentful-clients')
const { confirmation } = require('../../../lib/utils/actions')

const mockOutput = output as jest.MockedFunction<typeof output>
const mockWarning = warning as jest.MockedFunction<typeof warning>
const mockLogError = logError as jest.MockedFunction<typeof logError>
const mockCreatePlainClient = createPlainClient as jest.MockedFunction<any>
const mockConfirmation = confirmation as jest.MockedFunction<any>

// Shared fake plain client
const fakeClient = { entry: {}, asset: {}, contentType: {} }

beforeEach(() => {
  jest.clearAllMocks()
  mockCreatePlainClient.mockResolvedValue(fakeClient)
})

// Helper: build a minimal valid CommandConfig
function makeConfig(overrides: Partial<CommandConfig> = {}): CommandConfig {
  return {
    command: 'list',
    desc: 'List items',
    feature: 'item-list',
    handler: jest.fn().mockResolvedValue({ items: [] }),
    ...overrides
  }
}

// Helper: build a mock yargs builder that records all calls and chains
function mockYargs() {
  const calls: Record<string, any[][]> = {}

  const handler = {
    get(target: any, prop: string) {
      if (prop === '_calls') return calls
      return (...args: any[]) => {
        if (!calls[prop]) calls[prop] = []
        calls[prop].push(args)
        return yargsInstance
      }
    }
  }

  const yargsInstance: any = new Proxy({}, handler)
  return yargsInstance
}

// ---------------------------------------------------------------------------
// Shape tests
// ---------------------------------------------------------------------------

describe('createCommand — returned shape', () => {
  it('returns command, desc, builder, and handler', () => {
    const result = createCommand(makeConfig())
    expect(result).toHaveProperty('command', 'list')
    expect(result).toHaveProperty('desc', 'List items')
    expect(typeof result.builder).toBe('function')
    expect(typeof result.handler).toBe('function')
  })

  it('preserves command string including positional args', () => {
    const result = createCommand(makeConfig({ command: 'get <id>' }))
    expect(result.command).toBe('get <id>')
  })
})

// ---------------------------------------------------------------------------
// Builder tests
// ---------------------------------------------------------------------------

describe('createCommand — builder', () => {
  it('wires --space-id option', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('space-id')
  })

  it('wires --environment-id option', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('environment-id')
  })

  it('wires --management-token option', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('management-token')
  })

  it('wires --header option', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('header')
  })

  it('wires --json option', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('json')
  })

  it('wires --agent-mode option', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('agent-mode')
  })

  it('wires --quiet option', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('quiet')
  })

  it('adds --yes when needsConfirmation is true', () => {
    const { builder } = createCommand(makeConfig({ needsConfirmation: true }))
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('yes')
  })

  it('does NOT add --yes when needsConfirmation is false', () => {
    const { builder } = createCommand(makeConfig({ needsConfirmation: false }))
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).not.toContain('yes')
  })

  it('adds --dry-run when supportsDryRun is true', () => {
    const { builder } = createCommand(makeConfig({ supportsDryRun: true }))
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('dry-run')
  })

  it('does NOT add --dry-run when supportsDryRun is false', () => {
    const { builder } = createCommand(makeConfig({ supportsDryRun: false }))
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).not.toContain('dry-run')
  })

  it('adds extra options from config.options', () => {
    const { builder } = createCommand(
      makeConfig({
        options: {
          'content-type': { type: 'string', describe: 'Content type ID' }
        }
      })
    )
    const yargs = mockYargs()
    builder(yargs)
    const optionCalls: string[] = yargs._calls.option.map((c: any[]) => c[0])
    expect(optionCalls).toContain('content-type')
  })

  it('sets epilog with copyright', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    expect(yargs._calls.epilog).toBeDefined()
    expect(yargs._calls.epilog[0][0]).toContain('Contentful')
  })

  it('sets usage when config.usage is provided', () => {
    const { builder } = createCommand(
      makeConfig({ usage: 'Usage: contentful items list' })
    )
    const yargs = mockYargs()
    builder(yargs)
    expect(yargs._calls.usage).toBeDefined()
    expect(yargs._calls.usage[0][0]).toBe('Usage: contentful items list')
  })

  it('does not call usage when config.usage is not provided', () => {
    const { builder } = createCommand(makeConfig())
    const yargs = mockYargs()
    builder(yargs)
    expect(yargs._calls.usage).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Handler tests
// ---------------------------------------------------------------------------

describe('createCommand — handler', () => {
  const baseArgv = {
    spaceId: 'my-space',
    environmentId: 'master',
    managementToken: 'token-abc',
    header: undefined
  }

  it('creates plain client with correct params', async () => {
    const { handler } = createCommand(makeConfig())
    await handler(baseArgv)
    expect(mockCreatePlainClient).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'token-abc',
        feature: 'item-list'
      }),
      expect.objectContaining({
        spaceId: 'my-space',
        environmentId: 'master'
      })
    )
  })

  it('calls action handler with plain client and argv', async () => {
    const actionHandler = jest.fn().mockResolvedValue({ items: [] })
    const { handler } = createCommand(makeConfig({ handler: actionHandler }))
    await handler(baseArgv)
    expect(actionHandler).toHaveBeenCalledWith(fakeClient, baseArgv)
  })

  it('routes result through output()', async () => {
    const resultData = { items: [{ id: 'abc' }] }
    const actionHandler = jest.fn().mockResolvedValue(resultData)
    const { handler } = createCommand(makeConfig({ handler: actionHandler }))
    await handler(baseArgv)
    expect(mockOutput).toHaveBeenCalledWith(
      resultData,
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('passes json flag to output when --json is set', async () => {
    const { handler } = createCommand(makeConfig())
    await handler({ ...baseArgv, json: true })
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ json: true }),
      expect.any(Object)
    )
  })

  it('passes agentMode flag to output when --agent-mode is set', async () => {
    const { handler } = createCommand(makeConfig())
    await handler({ ...baseArgv, agentMode: true })
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ agentMode: true }),
      expect.any(Object)
    )
  })

  it('passes quiet flag to output when --quiet is set', async () => {
    const { handler } = createCommand(makeConfig())
    await handler({ ...baseArgv, quiet: true })
    expect(mockOutput).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ quiet: true }),
      expect.any(Object)
    )
  })

  it('passes quietExtractor to output when config provides one', async () => {
    const extractor = (d: any) => d.items.map((i: any) => i.id)
    const resultData = { items: [{ id: 'x1' }] }
    const actionHandler = jest.fn().mockResolvedValue(resultData)
    const { handler } = createCommand(
      makeConfig({ handler: actionHandler, quietExtractor: extractor })
    )
    await handler({ ...baseArgv, quiet: true })
    expect(mockOutput).toHaveBeenCalledWith(
      resultData,
      expect.objectContaining({ quiet: true }),
      expect.objectContaining({ quietExtractor: extractor })
    )
  })
})

// ---------------------------------------------------------------------------
// Dry-run tests
// ---------------------------------------------------------------------------

describe('createCommand — dry-run', () => {
  const baseArgv = {
    spaceId: 'sp1',
    environmentId: 'master',
    managementToken: 'tok',
    dryRun: true
  }

  it('calls dryRunHandler instead of handler when --dry-run is set', async () => {
    const actionHandler = jest.fn().mockResolvedValue({})
    const dryRunHandler = jest.fn().mockResolvedValue({ preview: true })
    const { handler } = createCommand(
      makeConfig({
        supportsDryRun: true,
        handler: actionHandler,
        dryRunHandler
      })
    )
    await handler(baseArgv)
    expect(dryRunHandler).toHaveBeenCalledWith(fakeClient, baseArgv)
    expect(actionHandler).not.toHaveBeenCalled()
  })

  it('logs dry-run warning message', async () => {
    const { handler } = createCommand(
      makeConfig({
        supportsDryRun: true,
        dryRunHandler: jest.fn().mockResolvedValue({})
      })
    )
    await handler(baseArgv)
    expect(mockWarning).toHaveBeenCalledWith(
      expect.stringContaining('[DRY RUN]')
    )
  })

  it('calls handler normally when --dry-run is not set', async () => {
    const actionHandler = jest.fn().mockResolvedValue({})
    const dryRunHandler = jest.fn().mockResolvedValue({})
    const { handler } = createCommand(
      makeConfig({
        supportsDryRun: true,
        handler: actionHandler,
        dryRunHandler
      })
    )
    await handler({ ...baseArgv, dryRun: false })
    expect(actionHandler).toHaveBeenCalled()
    expect(dryRunHandler).not.toHaveBeenCalled()
  })

  it('falls back to handler when dryRun is true but no dryRunHandler provided', async () => {
    const actionHandler = jest.fn().mockResolvedValue({ fallback: true })
    const { handler } = createCommand(
      makeConfig({
        supportsDryRun: true,
        handler: actionHandler
      })
    )
    await handler(baseArgv)
    expect(actionHandler).toHaveBeenCalled()
    expect(mockOutput).toHaveBeenCalledWith(
      { fallback: true },
      expect.any(Object),
      expect.any(Object)
    )
  })
})

// ---------------------------------------------------------------------------
// Confirmation tests
// ---------------------------------------------------------------------------

describe('createCommand — confirmation', () => {
  const baseArgv = {
    spaceId: 'sp1',
    environmentId: 'master',
    managementToken: 'tok'
  }

  it('prompts for confirmation when needsConfirmation is true and --yes is not set', async () => {
    mockConfirmation.mockResolvedValueOnce(true)
    const { handler } = createCommand(makeConfig({ needsConfirmation: true }))
    await handler(baseArgv)
    expect(mockConfirmation).toHaveBeenCalledTimes(1)
  })

  it('skips confirmation prompt when --yes is true', async () => {
    const { handler } = createCommand(makeConfig({ needsConfirmation: true }))
    await handler({ ...baseArgv, yes: true })
    expect(mockConfirmation).not.toHaveBeenCalled()
  })

  it('aborts execution when confirmation is denied', async () => {
    mockConfirmation.mockResolvedValueOnce(false)
    const actionHandler = jest.fn().mockResolvedValue({})
    const { handler } = createCommand(
      makeConfig({ needsConfirmation: true, handler: actionHandler })
    )
    await handler(baseArgv)
    expect(actionHandler).not.toHaveBeenCalled()
    expect(mockOutput).not.toHaveBeenCalled()
  })

  it('logs abort warning when confirmation is denied', async () => {
    mockConfirmation.mockResolvedValueOnce(false)
    const { handler } = createCommand(makeConfig({ needsConfirmation: true }))
    await handler(baseArgv)
    expect(mockWarning).toHaveBeenCalled()
  })

  it('uses custom confirmationMessage when provided', async () => {
    mockConfirmation.mockResolvedValueOnce(true)
    const { handler } = createCommand(
      makeConfig({
        needsConfirmation: true,
        confirmationMessage: 'Delete 42 entries?'
      })
    )
    await handler(baseArgv)
    expect(mockConfirmation).toHaveBeenCalledWith('Delete 42 entries?')
  })

  it('proceeds with action when confirmation is given', async () => {
    mockConfirmation.mockResolvedValueOnce(true)
    const actionHandler = jest.fn().mockResolvedValue({ items: [] })
    const { handler } = createCommand(
      makeConfig({ needsConfirmation: true, handler: actionHandler })
    )
    await handler(baseArgv)
    expect(actionHandler).toHaveBeenCalledWith(fakeClient, baseArgv)
  })
})

// ---------------------------------------------------------------------------
// Error classification tests
// ---------------------------------------------------------------------------

describe('createCommand — error handling', () => {
  const baseArgv = {
    spaceId: 'sp1',
    environmentId: 'master',
    managementToken: 'tok'
  }

  let exitSpy: jest.SpyInstance

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((_code?: any) => {
      throw new Error(`process.exit(${_code})`)
    })
  })

  afterEach(() => {
    exitSpy.mockRestore()
  })

  it('exits with code 2 when a 5xx error is thrown', async () => {
    const serverError = Object.assign(new Error('Server Error'), {
      response: { status: 500 }
    })
    mockCreatePlainClient.mockRejectedValueOnce(serverError)
    const { handler } = createCommand(makeConfig())
    await expect(handler(baseArgv)).rejects.toThrow('process.exit(2)')
    expect(exitSpy).toHaveBeenCalledWith(2)
  })

  it('exits with code 1 when a 4xx error is thrown', async () => {
    const clientError = Object.assign(new Error('Not Found'), {
      response: { status: 404 }
    })
    mockCreatePlainClient.mockRejectedValueOnce(clientError)
    const { handler } = createCommand(makeConfig())
    await expect(handler(baseArgv)).rejects.toThrow('process.exit(1)')
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('exits with code 1 for a generic error', async () => {
    mockCreatePlainClient.mockRejectedValueOnce(
      new Error('Something went wrong')
    )
    const { handler } = createCommand(makeConfig())
    await expect(handler(baseArgv)).rejects.toThrow('process.exit(1)')
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('calls logError when an error is thrown', async () => {
    const err = new Error('Boom')
    mockCreatePlainClient.mockRejectedValueOnce(err)
    const { handler } = createCommand(makeConfig())
    await expect(handler(baseArgv)).rejects.toThrow()
    expect(mockLogError).toHaveBeenCalledWith(err)
  })
})
