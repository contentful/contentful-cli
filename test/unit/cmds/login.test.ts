import { prompt, PromptModule } from 'inquirer'
import open from 'open'
import { handler as loginHandler } from '../../../lib/cmds/login'
import { getContext, setContext } from '../../../lib/context'
import { confirmation } from '../../../lib/utils/actions'

jest.mock('inquirer')
jest.mock('open')
jest.mock('../../../lib/utils/actions')
jest.mock('../../../lib/context')

const mockedRcConfig = {
  managementToken: 'mockedToken'
}

const mocks = {
  inquirerPrompt: prompt as jest.MockedFunction<PromptModule>,
  open: open as jest.MockedFunction<typeof open>,
  setContext: setContext as jest.MockedFunction<any>,
  getContext: getContext as jest.MockedFunction<any>,
  confirmation: confirmation as jest.MockedFunction<any>
}

mocks.inquirerPrompt.mockResolvedValue(mockedRcConfig)
mocks.setContext.mockResolvedValue(true)
mocks.getContext.mockResolvedValue({ managementToken: false })
mocks.confirmation.mockResolvedValue(true)

afterEach(() => {
  mocks.inquirerPrompt.mockClear()
  mocks.open.mockClear()
  mocks.confirmation.mockClear()
  mocks.setContext.mockClear()
  mocks.getContext.mockClear()
})

test('login - without error', async () => {
  const result = await loginHandler({ context: {} })

  if (['win32', 'darwin'].includes(process.platform)) {
    expect(open).toHaveBeenCalled()
    expect(mocks.open.mock.calls[0][0].includes('action=cli')).toBeTruthy()
  }
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(prompt).toHaveBeenCalledTimes(1)
  expect(setContext).toHaveBeenCalledTimes(1)
  expect(mocks.setContext.mock.calls[0][0]).toEqual(mockedRcConfig)
  expect(result).toBe(mockedRcConfig.managementToken)
})

test('login - uses host from config', async () => {
  await loginHandler({
    context: {
      host: 'api.eu.contentful.com'
    }
  })

  if (['win32', 'darwin'].includes(process.platform)) {
    expect(open).toHaveBeenCalled()
    expect(
      mocks.open.mock.calls[0][0].includes(
        'https://be.eu.contentful.com/oauth/'
      )
    ).toBeTruthy()
  }
})

test('login - uses default host without host in config', async () => {
  await loginHandler({
    context: {}
  })

  if (['win32', 'darwin'].includes(process.platform)) {
    expect(open).toHaveBeenCalled()
    expect(
      mocks.open.mock.calls[0][0].includes('https://be.contentful.com/oauth')
    ).toBeTruthy()
  }
})

test('login - user abort', async () => {
  mocks.confirmation.mockResolvedValueOnce(false)

  await loginHandler({ context: {} })

  expect(confirmation).toHaveBeenCalled()
  if (['win32', 'darwin'].includes(process.platform)) {
    expect(open).not.toHaveBeenCalled()
  }
  expect(setContext).not.toHaveBeenCalled()
  expect(prompt).not.toHaveBeenCalled()
})

test('login - already logged in', async () => {
  mocks.getContext.mockResolvedValueOnce({ managementToken: 'alreadyLoggedIn' })

  await loginHandler({ context: { managementToken: 'token' } })

  expect(open).not.toHaveBeenCalled()
  expect(setContext).not.toHaveBeenCalled()
  expect(prompt).not.toHaveBeenCalled()
})

test('login - with management-token flag', async () => {
  const result = await loginHandler({
    context: { managementToken: 'token' },
    ...mockedRcConfig
  })

  expect(setContext).toHaveBeenCalledTimes(1)
  expect(mocks.setContext.mock.calls[0][0]).toEqual(mockedRcConfig)
  expect(result).toBe(mockedRcConfig.managementToken)
  expect(prompt).not.toHaveBeenCalled()
})
