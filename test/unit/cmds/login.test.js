import inquirer from 'inquirer'
import opn from 'opn'

import { handler as loginHandler } from '../../../lib/cmds/login'
import { getContext, setContext } from '../../../lib/context'
import { confirmation } from '../../../lib/utils/actions'

jest.mock('inquirer')
jest.mock('opn')
jest.mock('../../../lib/utils/actions')
jest.mock('../../../lib/context')

const mockedRcConfig = {
  managementToken: 'mockedToken'
}
inquirer.prompt.mockResolvedValue(mockedRcConfig)
setContext.mockResolvedValue(true)
getContext.mockResolvedValue({ managementToken: false })
confirmation.mockResolvedValue(true)

afterEach(() => {
  inquirer.prompt.mockClear()
  opn.mockClear()
  confirmation.mockClear()
  setContext.mockClear()
  getContext.mockClear()
})

test('login - without error', async () => {
  const result = await loginHandler({context: {}})

  if (['win32', 'darwin'].includes(process.platform)) {
    expect(opn).toHaveBeenCalled()
  }
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(inquirer.prompt).toHaveBeenCalledTimes(1)
  expect(setContext).toHaveBeenCalledTimes(1)
  expect(setContext.mock.calls[0][0]).toEqual(mockedRcConfig)
  expect(result).toBe(mockedRcConfig.managementToken)
})

test('login - user abort', async () => {
  confirmation.mockResolvedValueOnce(false)

  await loginHandler({context: {}})

  expect(confirmation).toHaveBeenCalled()
  if (['win32', 'darwin'].includes(process.platform)) {
    expect(opn).not.toHaveBeenCalled()
  }
  expect(setContext).not.toHaveBeenCalled()
  expect(inquirer.prompt).not.toHaveBeenCalled()
})

test('login - already logged in', async () => {
  getContext.mockResolvedValueOnce({ managementToken: 'alreadyLoggedIn' })

  await loginHandler({context: {managementToken: 'token'}})

  expect(opn).not.toHaveBeenCalled()
  expect(setContext).not.toHaveBeenCalled()
  expect(inquirer.prompt).not.toHaveBeenCalled()
})
