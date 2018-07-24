import test from 'ava'
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

test.before(() => {
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

test.after.always(() => {
  contextRewireAPI.__ResetDependency__('readFile')
  contextRewireAPI.__ResetDependency__('writeFile')
})

test.afterEach((t) => {
  readFileStub.resetHistory()
  writeFileStub.resetHistory()
})

test('locates correct config file path', async (t) => {
  const testFilePath = process.cwd() + '/.contentfulrc.json'
  await writeFile(testFilePath, 'test rc file')
  t.is(await getConfigPath(), testFilePath)
  return unlink(testFilePath)
})

test('uses home directory as config file path if none is found', async (t) => {
  const findUpStub = stub().returns(null)
  contextRewireAPI.__Rewire__('findUp', findUpStub)
  const configPath = await getConfigPath()
  t.is(configPath, resolve(homedir(), '.contentfulrc.json'))
  contextRewireAPI.__ResetDependency__('findUp')
})

test.serial('loading, writing, setting and getting context & rc', async (t) => {
  let context = await getContext()
  let contextSize = Object.keys(context).length

  t.is(contextSize, 0, 'context is empty in the beginning')
  t.true(readFileStub.calledOnce, 'tries to load runtime config')

  setContext({ newValue: true })
  context = await getContext()

  t.deepEqual(context, {
    newValue: true
  }, 'new value is present in context')

  setContext(JSON.parse(MOCKED_RC))
  await storeRuntimeConfig()

  t.true(writeFileStub.calledOnce, 'tries to write runtime config')
  t.is(writeFileStub.args[0][0], await getConfigPath(), 'writes to correct file location')
  t.is(writeFileStub.args[0][1], MOCKED_RC, 'updated rc file only contains relevant content')
})

test.serial('loading existing rc config and attaching it to the context', async (t) => {
  const readFileStub = stub().resolves({ toString: () => MOCKED_RC })
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  readFileStub.reset()
  readFileStub.resolves(MOCKED_RC)
  emptyContext()

  let context = await getContext()
  let contextSize = Object.keys(context).length

  t.is(contextSize, 2, 'fresh context contains only two values')
  t.deepEqual(context, JSON.parse(MOCKED_RC), 'fresh context matches the rc file config')
  contextRewireAPI.__ResetDependency__('readFile')
})

test('loadProxyFromEnv', (t) => {
  const loadProxyFromEnv = contextRewireAPI.__get__('loadProxyFromEnv')
  let proxy

  proxy = loadProxyFromEnv({ http_proxy: '127.0.0.1:3128' })
  t.deepEqual(proxy, { proxy: { host: '127.0.0.1', port: 3128, isHttps: false } }, 'uses http_proxy')

  proxy = loadProxyFromEnv({ https_proxy: 'https://127.0.0.1:3128' })
  t.deepEqual(proxy, { proxy: { host: '127.0.0.1', port: 3128, isHttps: true } }, 'uses https_proxy')

  proxy = loadProxyFromEnv({ HTTP_PROXY: '127.0.0.1:3128' })
  t.deepEqual(proxy, { proxy: { host: '127.0.0.1', port: 3128, isHttps: false } }, 'uses HTTP_PROXY')

  proxy = loadProxyFromEnv({ HTTPS_PROXY: 'https://127.0.0.1:3128' })
  t.deepEqual(proxy, { proxy: { host: '127.0.0.1', port: 3128, isHttps: true } }, 'uses HTTPS_PROXY')

  proxy = loadProxyFromEnv({ http_proxy: '127.0.0.1:3128', https_proxy: 'https://127.0.0.1:3128' })
  t.deepEqual(proxy, { proxy: { host: '127.0.0.1', port: 3128, isHttps: true } }, 'prefers https_proxy')
})
