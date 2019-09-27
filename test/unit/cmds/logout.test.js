const { logout } = require('../../../lib/cmds/logout')
const { storeRuntimeConfig, setContext } = require('../../../lib/context')
const { assertLoggedIn } = require('../../../lib/utils/assertions')
const { confirmation } = require('../../../lib/utils/actions')
const { log, warning, success } = require('../../../lib/utils/log')

jest.mock('../../../lib/context')
jest.mock('../../../lib/utils/actions')
jest.mock('../../../lib/utils/log')
jest.mock('../../../lib/utils/assertions')

assertLoggedIn.mockResolvedValue(true)
setContext.mockResolvedValue(true)
confirmation.mockResolvedValue(true)

afterEach(() => {
  log.mockClear()
  success.mockClear()
  warning.mockClear()
  confirmation.mockClear()
  setContext.mockClear()
  assertLoggedIn.mockClear()
  storeRuntimeConfig.mockClear()
})

test('logout is actually logging out', async () => {
  confirmation.mockResolvedValueOnce(true)
  await logout({})
  expect(warning).toHaveBeenCalledWith(
    'This will log you out by deleting the CMA token stored on your system.'
  )
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenCalledWith('Successfully logged you out.')
  expect(log).not.toHaveBeenCalled()
  expect(setContext).toHaveBeenCalledTimes(1)
  expect(setContext.mock.calls[0][0]).toMatchObject({ managementToken: null })
  expect(storeRuntimeConfig).toHaveBeenCalledTimes(1)
})

test('logout is abortable', async () => {
  confirmation.mockResolvedValueOnce(false)
  await logout({})
  expect(warning).toHaveBeenCalledWith(
    'This will log you out by deleting the CMA token stored on your system.'
  )
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(log).toHaveBeenCalledWith('Log out aborted by user.')
  expect(success).not.toHaveBeenCalled()
  expect(setContext).not.toHaveBeenCalled()
  expect(storeRuntimeConfig).not.toHaveBeenCalled()
})
