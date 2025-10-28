/* Unit tests for organization sec-check command */
const { securityCheck } = require('../../../../lib/cmds/organization_cmds/sec-check')
const { createPlainClient } = require('../../../../lib/utils/contentful-clients')
const { log } = require('../../../../lib/utils/log')

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/log')

const exitStub = jest.fn()
let originalExit: any = null

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

function mockClient(userId: string | null, role: string | null) {
  const rawGet = jest.fn().mockImplementation((path: string, opts?: any) => {
    if (path === '/users/me') {
      if (userId) {
        return Promise.resolve({ data: { sys: { id: userId } } })
      }
      return Promise.resolve({})
    }
    if (path.includes('/organization_memberships')) {
      const items = role
        ? [
            {
              role,
              user: { sys: { id: userId || 'no-user' } }
            }
          ]
        : []
      return Promise.resolve({ data: { items } })
    }
    return Promise.reject(new Error('Unexpected path'))
  })
  ;(createPlainClient as unknown as jest.Mock).mockResolvedValue({ raw: { get: rawGet } })
  return rawGet
}

const ORG_ID = 'org123'

test('sec-check success with owner role', async () => {
  const rawGet = mockClient('user123', 'owner')

  await securityCheck({
    context: { managementToken: 'token' },
    header: undefined,
    'organization-id': ORG_ID
  } as any)

  expect(createPlainClient).toHaveBeenCalledTimes(1)
  expect(rawGet).toHaveBeenCalled()
  expect(exitStub).not.toHaveBeenCalled()
  const logged = (log as jest.Mock).mock.calls.map(c => c[0]).join('\n')
})

test('sec-check success with admin role', async () => {
  const rawGet = mockClient('user123', 'admin')

  await securityCheck({
    context: { managementToken: 'token' },
    header: undefined,
    'organization-id': ORG_ID
  } as any)

  expect(exitStub).not.toHaveBeenCalled()
  const logged = (log as jest.Mock).mock.calls.map(c => c[0]).join('\n')
})

test('sec-check insufficient role', async () => {
  mockClient('user123', 'member')

  await securityCheck({
    context: { managementToken: 'token' },
    header: undefined,
    'organization-id': ORG_ID
  } as any)

  expect(exitStub).toHaveBeenCalledWith(1)
  const logged = (log as jest.Mock).mock.calls.map(c => c[0]).join('\n')
  expect(logged).toContain('Insufficient permissions')
})

test('sec-check missing management token', async () => {
  await securityCheck({
    context: {},
    header: undefined,
    'organization-id': ORG_ID
  } as any)

  expect(exitStub).toHaveBeenCalledWith(1)
  const logged = (log as jest.Mock).mock.calls.map(c => c[0]).join('\n')
  expect(logged).toContain('Missing management token')
})

test('sec-check missing user id response', async () => {
  // user returns without id
  const rawGet = jest.fn().mockImplementation((path: string) => {
    if (path === '/users/me') return Promise.resolve({ data: {} })
    return Promise.resolve({ data: { items: [] } })
  })
  ;(createPlainClient as unknown as jest.Mock).mockResolvedValue({ raw: { get: rawGet } })

  await securityCheck({
    context: { managementToken: 'token' },
    header: undefined,
    'organization-id': ORG_ID
  } as any)

  expect(exitStub).toHaveBeenCalledWith(1)
  const logged = (log as jest.Mock).mock.calls.map(c => c[0]).join('\n')
  expect(logged).toContain('Unable to determine user ID')
})

