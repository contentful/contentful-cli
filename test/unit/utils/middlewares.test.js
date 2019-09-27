const {
  buildContext,
  getCommand,
  assertContext
} = require('../../../lib/utils/middlewares')

const { getContext } = require('../../../lib/context')
const { handleAsyncError } = require('../../../lib/utils/async')
const {
  assertLoggedIn,
  assertSpaceIdProvided
} = require('../../../lib/utils/assertions')

jest.mock('../../../lib/context')
jest.mock('../../../lib/utils/styles')
jest.mock('../../../lib/utils/async')
jest.mock('../../../lib/config', () => ({
  noAuthNeeded: ['config add', 'config list', 'config remove'],
  noSpaceIdNeeded: [
    'logout',
    'config add',
    'config list',
    'config remove',
    'space create',
    'space list'
  ]
}))
jest.mock('yargs', () => ({
  getContext: () => ({ fullCommands: ['config', 'list'] })
}))

handleAsyncError.mockReturnValue(jest.fn())
getContext.mockResolvedValue({})

afterEach(() => {
  getContext.mockClear()
  handleAsyncError.mockClear()
})

const defaults = {
  context: {
    host: 'api.contentful.com',
    activeEnvironmentId: 'master'
  }
}

test('useFlagsIfAvailable set defaults', async () => {
  const result = await buildContext({})
  expect(result).toEqual(defaults)
})

test('useFlagsIfAvailable set activeSpaceId (overwrite context)', async () => {
  getContext.mockResolvedValueOnce({
    activeSpaceId: 'spaceId'
  })
  const result = await buildContext({ spaceId: 'activeSpaceId' })
  expect(result).toEqual({
    context: { ...defaults.context, activeSpaceId: 'activeSpaceId' }
  })
})

test('useFlagsIfAvailable set activeSpaceId (from context)', async () => {
  getContext.mockResolvedValueOnce({
    activeSpaceId: 'spaceId'
  })
  const result = await buildContext({})
  expect(result).toEqual({
    context: { ...defaults.context, activeSpaceId: 'spaceId' }
  })
})

test('useFlagsIfAvailable set managementToken (overwrite context)', async () => {
  getContext.mockResolvedValueOnce({
    managementToken: 'managementToken'
  })
  const result = await buildContext({ managementToken: 'managementToken' })
  expect(result).toEqual({
    context: { ...defaults.context, managementToken: 'managementToken' }
  })
})

test('useFlagsIfAvailable set managementToken (from context)', async () => {
  getContext.mockResolvedValueOnce({
    managementToken: 'managementToken'
  })
  const result = await buildContext({})
  expect(result).toEqual({
    context: { ...defaults.context, managementToken: 'managementToken' }
  })
})

test('useFlagsIfAvailable set activeEnvironmentId (overwrite context)', async () => {
  getContext.mockResolvedValueOnce({
    activeEnvironmentId: 'activeEnvironmentId'
  })
  const result = await buildContext({ environmentId: 'environmentId' })
  expect(result).toEqual({
    context: { ...defaults.context, activeEnvironmentId: 'environmentId' }
  })
})

test('useFlagsIfAvailable set activeEnvironmentId (from context)', async () => {
  getContext.mockResolvedValueOnce({
    activeEnvironmentId: 'activeEnvironmentId'
  })
  const result = await buildContext({})
  expect(result).toEqual({
    context: { ...defaults.context, activeEnvironmentId: 'activeEnvironmentId' }
  })
})

test('useFlagsIfAvailable set rawProxy to true', async () => {
  getContext.mockResolvedValue({})
  const result = await buildContext({ rawProxy: true })
  expect(result).toEqual({ context: { ...defaults.context, rawProxy: true } })
})

test('useFlagsIfAvailable set rawProxy to false', async () => {
  getContext.mockResolvedValueOnce({})
  const result = await buildContext({ rawProxy: false })
  expect(result).toEqual({ context: { ...defaults.context, rawProxy: false } })
})

test('useFlagsIfAvailable set proxy', async () => {
  getContext.mockResolvedValueOnce({})
  const result = await buildContext({ proxy: 'proxy' })
  expect(result).toEqual({ context: { ...defaults.context, proxy: 'proxy' } })
})

test('useFlagsIfAvailable set host', async () => {
  getContext.mockResolvedValueOnce({})
  const result = await buildContext({ host: 'host' })
  expect(result).toEqual({ context: { ...defaults.context, host: 'host' } })
})

test('getCommand', async () => {
  const result = await getCommand()
  expect(result).toEqual({ cmd: 'config list' })
})

test('assertContext do not fail if context is valid', async () => {
  await assertContext({
    cmd: 'foo bar',
    context: {
      managementToken: 'managementToken',
      spaceId: 'spaceId'
    }
  })
  expect(handleAsyncError).toHaveBeenCalledWith(assertLoggedIn)
  expect(handleAsyncError).toHaveBeenLastCalledWith(assertSpaceIdProvided)
})

test('assertContext fail if context token is invalid', async () => {
  await assertContext({
    cmd: 'foo bar',
    context: {
      managementToken: null,
      spaceId: 'spaceId'
    }
  })
  expect(handleAsyncError).toHaveBeenCalledWith(assertLoggedIn)
  expect(handleAsyncError).toHaveBeenLastCalledWith(assertSpaceIdProvided)
})

test('assertContext fail if spaceId is invalid', async () => {
  await assertContext({
    cmd: 'logout',
    context: {
      managementToken: 'token',
      spaceId: null
    }
  })
  expect(handleAsyncError).toHaveBeenCalledWith(assertLoggedIn)
  expect(handleAsyncError).not.toHaveBeenCalledWith(assertSpaceIdProvided)
})

test('assertContext pass if context not needed', async () => {
  await assertContext({
    cmd: 'config list',
    context: {
      managementToken: null,
      spaceId: 'spaceId'
    }
  })
  expect(handleAsyncError).not.toHaveBeenCalled()
})
