import { logout } from '../../../lib/cmds/logout'
import {
  storeRuntimeConfig,
  setContext
} from '../../../lib/context'
import { assertLoggedIn } from '../../../lib/utils/assertions'
import { confirmation } from '../../../lib/utils/actions'
import { log, warning, success } from '../../../lib/utils/log'
import { PreconditionFailedError } from '../../../lib/utils/error'

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

test('logout fails when not logged in', async () => {
  assertLoggedIn.mockRejectedValueOnce(new PreconditionFailedError())
  await expect(logout({})).rejects.toThrowError(PreconditionFailedError)
  expect(assertLoggedIn).toHaveBeenCalledTimes(1)
  expect(warning).not.toHaveBeenCalled()
  expect(success).not.toHaveBeenCalled()
  expect(log).not.toHaveBeenCalled()
  expect(setContext).not.toHaveBeenCalled()
  expect(storeRuntimeConfig).not.toHaveBeenCalled()
})

test('logout is actually logging out', async () => {
  confirmation.mockResolvedValueOnce(true)
  await logout({})
  expect(warning).toHaveBeenCalledWith('This will log you out by deleting the CMA token stored on your system.')
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(success).toHaveBeenCalledWith('Successfully logged you out.')
  expect(log).not.toHaveBeenCalled()
  expect(setContext).toHaveBeenCalledTimes(1)
  expect(setContext.mock.calls[0][0]).toMatchObject({ cmaToken: null })
  expect(storeRuntimeConfig).toHaveBeenCalledTimes(1)
})

test('logout is abortable', async () => {
  confirmation.mockResolvedValueOnce(false)
  await logout({})
  expect(warning).toHaveBeenCalledWith('This will log you out by deleting the CMA token stored on your system.')
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(log).toHaveBeenCalledWith('Log out aborted by user.')
  expect(success).not.toHaveBeenCalled()
  expect(setContext).not.toHaveBeenCalled()
  expect(storeRuntimeConfig).not.toHaveBeenCalled()
})
