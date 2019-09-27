const { resolve } = require('path')
const { homedir } = require('os')

const customConfigPath = resolve(process.cwd(), '.contentfulrc.json')
const homeConfigPath = resolve(homedir(), '.contentfulrc.json')
const MOCKED_RC =
  '{\n  "managementToken": "mocked",\n  "activeSpaceId": "mocked"\n}\n'
const enoent = new Error()
enoent.code = 'ENOENT'

beforeEach(() => {
  jest.resetModules()
})

test('locates correct config file path', async () => {
  jest.mock('find-up')
  const { getConfigPath } = require('../../lib/context')
  const findUp = require('find-up')
  findUp.mockResolvedValueOnce(customConfigPath)

  const configPath = await getConfigPath()
  expect(configPath).toBe(customConfigPath)
})

test('uses home directory as config file path if none is found', async () => {
  jest.mock('find-up')
  const { getConfigPath } = require('../../lib/context')

  const configPath = await getConfigPath()
  expect(configPath).toBe(homeConfigPath)
})

test('loading, writing, setting and getting context & rc', async () => {
  jest.mock('find-up')
  jest.mock('mz/fs')
  const { readFile, writeFile } = require('mz/fs')
  readFile.mockRejectedValue(enoent)

  const {
    getContext,
    setContext,
    storeRuntimeConfig
  } = require('../../lib/context')

  let context = await getContext()
  let contextSize = Object.keys(context).length

  expect(contextSize).toBe(0)
  expect(readFile).toHaveBeenCalledTimes(1)

  setContext({ newValue: true })
  context = await getContext()

  expect(context).toEqual({
    newValue: true
  })

  setContext(JSON.parse(MOCKED_RC))
  await storeRuntimeConfig()

  expect(writeFile).toHaveBeenCalledTimes(1)
  expect(writeFile.mock.calls[0][0]).toBe(homeConfigPath)
  expect(writeFile.mock.calls[0][1]).toBe(MOCKED_RC)
})

test('loading existing rc config and attaching it to the context', async () => {
  jest.mock('find-up')
  jest.mock('mz/fs')
  const { readFile } = require('mz/fs')
  readFile.mockResolvedValue({ toString: () => MOCKED_RC })

  const { getContext } = require('../../lib/context')

  let context = await getContext()
  let contextSize = Object.keys(context).length

  expect(contextSize).toBe(2)
  expect(context).toEqual(JSON.parse(MOCKED_RC))
})

test('loadProxyFromEnv', async () => {
  jest.mock('mz/fs')
  const { readFile } = require('mz/fs')
  const { emptyContext, getContext } = require('../../lib/context')
  readFile.mockResolvedValue({ toString: () => MOCKED_RC })
  let context

  function resetEnv() {
    emptyContext()
    delete process.env.http_proxy
    delete process.env.https_proxy
    delete process.env.HTTP_PROXY
    delete process.env.HTTPS_PROXY
  }

  resetEnv()
  process.env.http_proxy = '127.0.0.1:3128'
  context = await getContext()
  expect(context.proxy).toEqual({
    host: '127.0.0.1',
    port: 3128,
    isHttps: false
  })

  resetEnv()
  process.env.https_proxy = 'https://127.0.0.1:3128'
  context = await getContext()
  expect(context.proxy).toEqual({
    host: '127.0.0.1',
    port: 3128,
    isHttps: true
  })

  resetEnv()
  process.env.HTTP_PROXY = '127.0.0.1:3128'
  context = await getContext()
  expect(context.proxy).toEqual({
    host: '127.0.0.1',
    port: 3128,
    isHttps: false
  })

  resetEnv()
  process.env.HTTPS_PROXY = 'https://127.0.0.1:3128'
  context = await getContext()
  expect(context.proxy).toEqual({
    host: '127.0.0.1',
    port: 3128,
    isHttps: true
  })

  resetEnv()
  process.env.http_proxy = '127.0.0.1:3128'
  process.env.https_proxy = 'https://127.0.0.1:3128'
  context = await getContext()
  expect(context.proxy).toEqual({
    host: '127.0.0.1',
    port: 3128,
    isHttps: true
  })
})
