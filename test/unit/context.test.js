import test from 'ava'
import { stub } from 'sinon'
import { resolve } from 'path'
import { homedir } from 'os'

import {
  getConfigPath,
  getContext,
  setContext,
  emptyContext,
  storeRuntimeConfig,
  __RewireAPI__ as contextRewireAPI
} from '../../lib/context'

const MOCKED_RC = '{\n  "cmaToken": "mocked",\n  "activeSpaceId": "mocked"\n}\n'

const statStub = stub().rejects()
const writeFileStub = stub()

test.before(() => {
  contextRewireAPI.__Rewire__('stat', statStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

test.after.always(() => {
  contextRewireAPI.__ResetDependency__('stat')
  contextRewireAPI.__ResetDependency__('writeFile')
})

test.afterEach((t) => {
  statStub.resetHistory()
  writeFileStub.resetHistory()
})

test('locates correct config file path', (t) => {
  const configPath = getConfigPath()
  t.is(configPath, resolve(homedir(), '.contentfulrc.json'))
})

test.serial('loading, writing, setting and getting context & rc', async (t) => {
  let context = await getContext()
  let contextSize = Object.keys(context).length

  t.is(contextSize, 0, 'context is empty in the beginning')
  t.true(statStub.calledOnce, 'tries to load runtime config')

  setContext({ newValue: true })
  context = await getContext()

  t.deepEqual(context, {
    newValue: true
  }, 'new value is present in context')

  setContext(JSON.parse(MOCKED_RC))
  storeRuntimeConfig()

  t.true(writeFileStub.calledOnce, 'tries to write runtime config')
  t.is(writeFileStub.args[0][0], getConfigPath(), 'writes to correct file location')
  t.is(writeFileStub.args[0][1], MOCKED_RC, 'updated rc file only contains relevant content')
})

test.serial('loading existing rc config and attaching it to the context', async (t) => {
  const readFileStub = stub().resolves({ toString: () => MOCKED_RC })
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  statStub.reset()
  statStub.resolves(MOCKED_RC)
  emptyContext()

  let context = await getContext()
  let contextSize = Object.keys(context).length

  t.is(contextSize, 2, 'fresh context contains only two values')
  t.deepEqual(context, JSON.parse(MOCKED_RC), 'fresh context matches the rc file config')
  contextRewireAPI.__ResetDependency__('readFile')
})
