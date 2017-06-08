import test from 'ava'
import { addHandler, __RewireAPI__ as addRewire } from '../../../../lib/cmds/config_cmds/add'
import { stub } from 'sinon'

const setContextStub = stub()
test.beforeEach(() => {
  addRewire.__Rewire__('getContext', stub())
  addRewire.__Rewire__('setContext', setContextStub)
  addRewire.__Rewire__('getContext', stub().resolves({}))
  addRewire.__Rewire__('storeRuntimeConfig', stub().resolves())
  addRewire.__Rewire__('success', stub())
})

test.afterEach(() => {
  addRewire.__ResetDependency__('getContext')
  addRewire.__ResetDependency__('setContext')
  addRewire.__ResetDependency__('getContext')
  addRewire.__ResetDependency__('storeRuntimeConfig')
})

test('config add command', async (t) => {
  await addHandler({proxy: 'user:password@host:8080'})
  const expectedProxy = {
    host: 'host',
    port: 8080,
    auth: {
      username: 'user',
      password: 'password'
    }
  }
  t.deepEqual(setContextStub.args[0][0].proxy, expectedProxy)
})
