/* Unit tests for sso_exempt_users_with_mfa_disabled security check */
import { securityCheck } from '../../../../lib/cmds/organization_cmds/sec-check'
import { createPlainClient } from '../../../../lib/utils/contentful-clients'
import { log } from '../../../../lib/utils/log'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

const exitStub = jest.fn()
let originalExit: unknown = null

beforeAll(() => {
  // @ts-ignore override process.exit for tests
  originalExit = global.process.exit
  // @ts-ignore
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

const ORG_ID = 'org123'

function lastJsonLogged() {
  const calls = (log as jest.Mock).mock.calls.map(c => c[0])
  for (let i = calls.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(calls[i])
    } catch {
      // ignore non-JSON log lines
    }
  }
  return null
}

test('sso_exempt_users_with_mfa_disabled', async () => {
  const rawGet = jest.fn().mockImplementation((path: string, opts?: any) => {
    if (path === '/users/me') {
      return Promise.resolve({ data: { sys: { id: 'requestingUser' } } })
    }
    if (path.endsWith('/identity_provider')) {
      return Promise.resolve({ data: { enabled: true, restricted: true } })
    }
    if (path.includes('/organization_memberships')) {
      if (opts?.params?.query) {
        return Promise.resolve({
          data: {
            items: [{ role: 'owner', user: { sys: { id: 'requestingUser' } } }]
          }
        })
      }
      return Promise.resolve({
        data: {
          total: 2,
          limit: 2,
          items: [
            { isExemptFromRestrictedMode: true, user: { sys: { id: 'ex1' } } },
            { isExemptFromRestrictedMode: true, user: { sys: { id: 'ex2' } } }
          ]
        }
      })
    }
    if (path.endsWith('/users/ex1')) {
      return Promise.resolve({
        data: { email: 'ex1@example.com', '2faEnabled': false }
      })
    }
    if (path.endsWith('/users/ex2')) {
      return Promise.resolve({
        data: { email: 'ex2@example.com', '2faEnabled': true }
      })
    }
    return Promise.reject(new Error('Unexpected path ' + path))
  })
  ;(createPlainClient as unknown as jest.Mock).mockResolvedValue({ raw: { get: rawGet } })

  await securityCheck({
    context: { managementToken: 'token' },
    header: undefined,
    'organization-id': ORG_ID
  } as any)

  const results = lastJsonLogged()
  expect(results).toBeTruthy()
  const check = (results as any).sso_exempt_users_with_mfa_disabled
  expect(check).toBeDefined()
  expect(check.pass).toBe(false)
  expect(check.data.mfaDisabledCount).toBe(1)
  expect(check.data.mfaDisabledUsers).toEqual([
    { id: 'ex1', email: 'ex1@example.com' }
  ])
})

test('sso_exempt_users_with_mfa_disabled all enabled', async () => {
  jest.clearAllMocks()
  const rawGet = jest.fn().mockImplementation((path: string, opts?: any) => {
    if (path === '/users/me') {
      return Promise.resolve({ data: { sys: { id: 'requestingUser' } } })
    }
    if (path.endsWith('/identity_provider')) {
      return Promise.resolve({ data: { enabled: true, restricted: true } })
    }
    if (path.includes('/organization_memberships')) {
      if (opts?.params?.query) {
        return Promise.resolve({
          data: {
            items: [{ role: 'admin', user: { sys: { id: 'requestingUser' } } }]
          }
        })
      }
      return Promise.resolve({
        data: {
          total: 2,
          limit: 2,
          items: [
            { isExemptFromRestrictedMode: true, user: { sys: { id: 'ex1' } } },
            { isExemptFromRestrictedMode: true, user: { sys: { id: 'ex2' } } }
          ]
        }
      })
    }
    if (path.endsWith('/users/ex1')) {
      return Promise.resolve({
        data: { email: 'ex1@example.com', '2faEnabled': true }
      })
    }
    if (path.endsWith('/users/ex2')) {
      return Promise.resolve({
        data: { email: 'ex2@example.com', '2faEnabled': true }
      })
    }
    return Promise.reject(new Error('Unexpected path ' + path))
  })
  ;(createPlainClient as unknown as jest.Mock).mockResolvedValue({ raw: { get: rawGet } })

  await securityCheck({
    context: { managementToken: 'token' },
    header: undefined,
    'organization-id': ORG_ID
  } as any)

  const results = lastJsonLogged()
  expect(results).toBeTruthy()
  const check = (results as any).sso_exempt_users_with_mfa_disabled
  expect(check).toBeDefined()
  expect(check.pass).toBe(true)
  expect(check.data.mfaDisabledCount).toBe(0)
  expect(check.data.mfaDisabledUsers).toEqual([])
})
