/* Unit tests for organization sec-check command (merged extended coverage) */
const { securityCheck } = require('../../../../lib/cmds/organization_cmds/sec-check')
const { createPlainClient } = require('../../../../lib/utils/contentful-clients')
// Added for output-file tests
const fs = require('fs')
const path = require('path')

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/log')

const exitStub = jest.fn()
let originalExit = null

beforeAll(() => {
  originalExit = global.process.exit
  // @ts-ignore override
  global.process.exit = exitStub
})

afterAll(() => {
  // @ts-ignore restore
  global.process.exit = originalExit
})

afterEach(() => {
  jest.clearAllMocks()
  exitStub.mockClear()
})

// Enhanced mock supporting all security check endpoints
function mockClient(userId, role, extra = {}) {
  const rawGet = jest.fn().mockImplementation(p => {
    if (p === '/users/me') {
      if (userId) return Promise.resolve({ data: { sys: { id: userId } } })
      return Promise.resolve({ data: {} })
    }
    if (p.includes('/organization_memberships')) {
      const items = role ? [{ role, user: { sys: { id: userId || 'no-user' } } }] : []
      return Promise.resolve({ data: { items } })
    }
    if (p.endsWith('/identity_provider')) {
      return Promise.resolve(extra.identity_provider || { data: { enabled: true, restricted: true } })
    }
    if (p.endsWith('/security_contacts')) {
      return Promise.resolve(extra.security_contacts || { data: { items: [{ email: 'sec@example.com' }] } })
    }
    if (p.endsWith('/access_tokens')) {
      return Promise.resolve(extra.access_tokens || { data: { items: [] } })
    }
    if (p.endsWith('/audit_log/config')) {
      return Promise.resolve(extra.audit_log_config || { data: { enabled: true } })
    }
    return Promise.reject(new Error('Unexpected path ' + p))
  })
  ;(createPlainClient).mockResolvedValue({ raw: { get: rawGet } })
  return rawGet
}

const ORG_ID = 'org123'

// Original baseline tests

test('sec-check success with owner role', async () => {
  const rawGet = mockClient('user123', 'owner')
  await securityCheck({ context: { managementToken: 'token' }, header: undefined, 'organization-id': ORG_ID })
  expect(createPlainClient).toHaveBeenCalledTimes(1)
  expect(rawGet).toHaveBeenCalled()
  expect(exitStub).not.toHaveBeenCalled()
})

test('sec-check success with admin role', async () => {
  mockClient('user123', 'admin')
  await securityCheck({ context: { managementToken: 'token' }, header: undefined, 'organization-id': ORG_ID })
  expect(exitStub).not.toHaveBeenCalled()
})

test('sec-check insufficient role', async () => {
  mockClient('user123', 'member')
  await securityCheck({ context: { managementToken: 'token' }, header: undefined, 'organization-id': ORG_ID })
  expect(exitStub).toHaveBeenCalledWith(1)
})

test('sec-check missing management token', async () => {
  await securityCheck({ context: {}, header: undefined, 'organization-id': ORG_ID })
  expect(exitStub).toHaveBeenCalledWith(1)
})

test('sec-check missing user id response', async () => {
  const rawGet = jest.fn().mockImplementation(p => {
    if (p === '/users/me') return Promise.resolve({ data: {} })
    if (p.includes('/organization_memberships')) return Promise.resolve({ data: { items: [] } })
    return Promise.resolve({})
  })
  ;(createPlainClient).mockResolvedValue({ raw: { get: rawGet } })
  await securityCheck({ context: { managementToken: 'token' }, header: undefined, 'organization-id': ORG_ID })
  expect(exitStub).toHaveBeenCalledWith(1)
})

// Extended coverage tests

test('writes default output file when -o flag is boolean true', async () => {
  mockClient('ownerA', 'owner')
  await securityCheck({ context: { managementToken: 'token' }, 'organization-id': ORG_ID, 'output-file': true })
  const dataDir = path.join(process.cwd(), 'data')
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('-org123-sec-check.json'))
  expect(files.length).toBeGreaterThan(0)
})

test('writes default output file when -o flag is empty string', async () => {
  mockClient('ownerB', 'owner')
  await securityCheck({ context: { managementToken: 'token' }, 'organization-id': ORG_ID, 'output-file': '' })
  const dataDir = path.join(process.cwd(), 'data')
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('-org123-sec-check.json'))
  expect(files.length).toBeGreaterThan(0)
})

test('writes custom output file using basename of provided path', async () => {
  const provided = 'some/sub/custom-out.json'
  const expected = path.join(process.cwd(), 'data', 'custom-out.json')
  if (fs.existsSync(expected)) fs.unlinkSync(expected)
  mockClient('ownerC', 'owner')
  await securityCheck({ context: { managementToken: 'token' }, 'organization-id': ORG_ID, 'output-file': provided })
  expect(fs.existsSync(expected)).toBe(true)
  const json = JSON.parse(fs.readFileSync(expected, 'utf8'))
  expect(json.permission_check.pass).toBe(true)
})

test('management-token arg overrides context token', async () => {
  const rawGet = mockClient('overrideUser', 'owner')
  ;(createPlainClient).mockImplementation(async params => {
    expect(params.accessToken).toBe('overrideToken')
    return { raw: { get: rawGet } }
  })
  await securityCheck({ context: { managementToken: 'contextToken' }, 'organization-id': ORG_ID, 'management-token': 'overrideToken' })
  expect(exitStub).not.toHaveBeenCalled()
})

test('skips sso_enforced when sso_enabled dependency fails', async () => {
  mockClient('ownerD', 'owner', { identity_provider: { data: { enabled: false, restricted: true } } })
  const outName = 'skip-dependency.json'
  const outPath = path.join(process.cwd(), 'data', outName)
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
  await securityCheck({ context: { managementToken: 'token' }, 'organization-id': ORG_ID, 'output-file': outName })
  const json = JSON.parse(fs.readFileSync(outPath, 'utf8'))
  expect(json.sso_enabled.pass).toBe(false)
  expect(json.sso_enforced.skipped).toBe(true)
  expect(json.sso_enforced.reason).toBe('dependency_failed')
})

test.skip('active_tokens_with_long_expiry fails with offending tokens present (deprecated)', async () => {
  // Deprecated: originally tested tokens without expiry
})

test('active_tokens_with_long_expiry fails with offending long-expiry tokens present', async () => {
  mockClient('ownerE', 'owner', { access_tokens: { data: { items: [
    { revokedAt: null, sys: { id: 'tok1', expiresAt: '2100-01-01T00:00:00Z' } },
    { revokedAt: null, sys: { id: 'tok2', expiresAt: '2100-06-01T00:00:00Z' } }
  ] } } })
  const outName = 'offending-tokens-merged.json'
  const outPath = path.join(process.cwd(), 'data', outName)
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
  await securityCheck({ context: { managementToken: 'token' }, 'organization-id': ORG_ID, 'output-file': outName })
  const json = JSON.parse(fs.readFileSync(outPath, 'utf8'))
  expect(json.active_tokens_with_long_expiry.pass).toBe(false)
  expect(json.active_tokens_with_long_expiry.data.offendingCount).toBe(2)
  expect(exitStub).not.toHaveBeenCalled()
})
