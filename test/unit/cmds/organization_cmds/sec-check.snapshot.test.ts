/* Snapshot tests for aggregated organization sec-check results */
const { securityCheck } = require('../../../../lib/cmds/organization_cmds/sec-check')
const { createPlainClient } = require('../../../../lib/utils/contentful-clients')
const { log } = require('../../../../lib/utils/log')

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/log')

const ORG_ID = 'org123'

afterEach(() => {
  jest.clearAllMocks()
})

function extractResults() {
  const logged = (log as jest.Mock).mock.calls.map(c => c[0])
  const jsonLine = logged.find(
    l => typeof l === 'string' && l.trim().startsWith('{') && l.includes('permission_check')
  )
  if (!jsonLine) return null
  try {
    return JSON.parse(jsonLine)
  } catch {
    return null
  }
}

function mockFullClient({
  userId = 'snapshotUser',
  role = 'owner',
  identity = { data: { enabled: true, restricted: true } },
  securityContacts = { data: { total: 1, items: [{ id: 'contact1' }] } },
  auditLogging = { data: { items: [{ id: 'auditCfg' }] } },
  accessTokens = {
    data: {
      total: 1,
      limit: 100,
      skip: 0,
      items: [
        { revokedAt: '2025-01-01', sys: { expiresAt: '2025-12-01', id: 'tok-ok' } }
      ]
    }
  },
  memberships = { data: { items: [{ role, user: { sys: { id: userId } } }], total: 1 } }
}: Record<string, any>) {
  const rawGet = jest.fn().mockImplementation((path: string, opts?: any) => {
    if (path === '/users/me') return Promise.resolve({ data: { sys: { id: userId } } })
    if (path.includes('/organization_memberships')) return Promise.resolve(memberships)
    if (path.includes('/identity_provider')) return Promise.resolve(identity)
    if (path.includes('/security_contacts')) return Promise.resolve(securityContacts)
    if (path.includes('/audit_logging/configurations')) {
      if (!opts?.headers || opts.headers['x-contentful-enable-alpha-feature'] !== 'audit-logging') {
        return Promise.reject(new Error('missing audit header'))
      }
      return Promise.resolve(auditLogging)
    }
    if (path.includes('/access_tokens')) return Promise.resolve(accessTokens)
    if (path.includes('/users/')) return Promise.resolve({ data: { email: path.split('/').pop() + '@mail.com', '2faEnabled': true } })
    return Promise.reject(new Error('Unexpected path: ' + path))
  })
  ;(createPlainClient as unknown as jest.Mock).mockResolvedValue({ raw: { get: rawGet } })
  return rawGet
}

const expectedIds = [
  'permission_check',
  'security_contact_set',
  'audit_logging_configured',
  'active_tokens_without_expiry',
  'sso_enabled',
  'sso_enforced',
  'sso_exempt_users',
  'sso_exempt_users_with_mfa_disabled'
]

test('snapshot: all checks pass', async () => {
  mockFullClient({})
  await securityCheck({
    context: { managementToken: 'token' },
    header: undefined,
    'organization-id': ORG_ID
  } as any)
  const results = extractResults()
  expect(results).toBeTruthy()
  expectedIds.forEach(id => expect(results[id]).toBeDefined())
  expectedIds.forEach(id => expect(results[id].pass).toBe(true))
  expect(results).toMatchSnapshot()
})

test('snapshot: sso_enabled false causes sso_enforced skip', async () => {
  mockFullClient({ identity: { data: { enabled: false, restricted: false } } })
  await securityCheck({
    context: { managementToken: 'token' },
    header: undefined,
    'organization-id': ORG_ID
  } as any)
  const results = extractResults()
  expect(results).toBeTruthy()
  expect(results.sso_enabled.pass).toBe(false)
  expect(results.sso_enforced.skipped).toBe(true)
  expect(results.sso_enforced.reason).toBe('dependency_failed')
  expect(results).toMatchSnapshot()
})

