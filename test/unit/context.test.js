import { stub } from 'sinon'
import { resolve } from 'path'
import { homedir } from 'os'
import { writeFile, unlink } from 'mz/fs'

import {
  getConfigPath,
  getContext,
  setContext,
  emptyContext,
  storeRuntimeConfig,
  __RewireAPI__ as contextRewireAPI
} from '../../lib/context'

const MOCKED_RC = '{\n  "cmaToken": "mocked",\n  "activeSpaceId": "mocked"\n}\n'

const enoent = new Error()
enoent.code = 'ENOENT'
const readFileStub = stub().rejects(enoent)
const writeFileStub = stub()

beforeAll(() => {
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

afterAll(() => {
  contextRewireAPI.__ResetDependency__('readFile')
  contextRewireAPI.__ResetDependency__('writeFile')
})

afterEach(() => {
  readFileStub.resetHistory()
  writeFileStub.resetHistory()
})

test('locates correct config file path', async () => {
  const testFilePath = process.cwd() + '/.contentfulrc.json'
  await writeFile(testFilePath, 'test rc file')
  expect(await getConfigPath()).toBe(testFilePath)
  return unlink(testFilePath)
})

test('uses home directory as config file path if none is found', async () => {
  const findUpStub = stub().returns(null)
  contextRewireAPI.__Rewire__('findUp', findUpStub)
  contextRewireAPI.__Rewire__('configPath', null)
  const configPath = await getConfigPath()
  expect(configPath).toBe(resolve(homedir(), '.contentfulrc.json'))
  contextRewireAPI.__ResetDependency__('findUp')
})

test('loading, writing, setting and getting context & rc', async () => {
  let context = await getContext()
  let contextSize = Object.keys(context).length

  expect(contextSize).toBe(0)
  expect(readFileStub.calledOnce).toBe(true)

  setContext({ newValue: true })
  context = await getContext()

  expect(context).toEqual({
    newValue: true
  })

  setContext(JSON.parse(MOCKED_RC))
  await storeRuntimeConfig()

  expect(writeFileStub.calledOnce).toBe(true)
  expect(writeFileStub.args[0][0]).toBe(await getConfigPath())
  expect(writeFileStub.args[0][1]).toBe(MOCKED_RC)
})

test(
  'loading existing rc config and attaching it to the context',
  async () => {
    const readFileStub = stub().resolves({ toString: () => MOCKED_RC })
    contextRewireAPI.__Rewire__('readFile', readFileStub)
    readFileStub.reset()
    readFileStub.resolves(MOCKED_RC)
    emptyContext()

    let context = await getContext()
    let contextSize = Object.keys(context).length

    expect(contextSize).toBe(2)
    expect(context).toEqual(JSON.parse(MOCKED_RC))
    contextRewireAPI.__ResetDependency__('readFile')
  }
)

test('loadProxyFromEnv', () => {
  const loadProxyFromEnv = contextRewireAPI.__get__('loadProxyFromEnv')
  let proxy

  proxy = loadProxyFromEnv({ http_proxy: '127.0.0.1:3128' })
  expect(proxy).toEqual({ proxy: { host: '127.0.0.1', port: 3128, isHttps: false } })

  proxy = loadProxyFromEnv({ https_proxy: 'https://127.0.0.1:3128' })
  expect(proxy).toEqual({ proxy: { host: '127.0.0.1', port: 3128, isHttps: true } })

  proxy = loadProxyFromEnv({ HTTP_PROXY: '127.0.0.1:3128' })
  expect(proxy).toEqual({ proxy: { host: '127.0.0.1', port: 3128, isHttps: false } })

  proxy = loadProxyFromEnv({ HTTPS_PROXY: 'https://127.0.0.1:3128' })
  expect(proxy).toEqual({ proxy: { host: '127.0.0.1', port: 3128, isHttps: true } })

  proxy = loadProxyFromEnv({ http_proxy: '127.0.0.1:3128', https_proxy: 'https://127.0.0.1:3128' })
  expect(proxy).toEqual({ proxy: { host: '127.0.0.1', port: 3128, isHttps: true } })
})
