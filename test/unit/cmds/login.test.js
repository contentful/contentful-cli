const inquirer = require('inquirer')
const open = require('open')

const { handler: loginHandler } = require('../../../lib/cmds/login')
const { getContext, setContext } = require('../../../lib/context')
const { confirmation } = require('../../../lib/utils/actions')

jest.mock('inquirer')
jest.mock('open')
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
  open.mockClear()
  confirmation.mockClear()
  setContext.mockClear()
  getContext.mockClear()
})

test('login - without error', async () => {
  const result = await loginHandler({ context: {} })

  if (['win32', 'darwin'].includes(process.platform)) {
    expect(open).toHaveBeenCalled()
  }
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(inquirer.prompt).toHaveBeenCalledTimes(1)
  expect(setContext).toHaveBeenCalledTimes(1)
  expect(setContext.mock.calls[0][0]).toEqual(mockedRcConfig)
  expect(result).toBe(mockedRcConfig.managementToken)
})

test('login - user abort', async () => {
  confirmation.mockResolvedValueOnce(false)

  await loginHandler({ context: {} })

  expect(confirmation).toHaveBeenCalled()
  if (['win32', 'darwin'].includes(process.platform)) {
    expect(open).not.toHaveBeenCalled()
  }
  expect(setContext).not.toHaveBeenCalled()
  expect(inquirer.prompt).not.toHaveBeenCalled()
})

test('login - already logged in', async () => {
  getContext.mockResolvedValueOnce({ managementToken: 'alreadyLoggedIn' })

  await loginHandler({ context: { managementToken: 'token' } })

  expect(open).not.toHaveBeenCalled()
  expect(setContext).not.toHaveBeenCalled()
  expect(inquirer.prompt).not.toHaveBeenCalled()
})

test('login - with management-token flag', async () => {
  const result = await loginHandler({
    context: { managementToken: 'token' },
    ...mockedRcConfig
  })

  expect(setContext).toHaveBeenCalledTimes(1)
  expect(setContext.mock.calls[0][0]).toEqual(mockedRcConfig)
  expect(result).toBe(mockedRcConfig.managementToken)
  expect(inquirer.prompt).not.toHaveBeenCalled()
})
