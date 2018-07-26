import test from 'ava'
import { removeHandler, __RewireAPI__ as removeRewire } from '../../../../lib/cmds/config_cmds/remove'
import { stub } from 'sinon'

const setContextStub = stub()
test.beforeEach(() => {
  removeRewire.__Rewire__('getContext', stub())
  removeRewire.__Rewire__('setContext', setContextStub)
  removeRewire.__Rewire__('getContext', stub().resolves({cmaToken: 'cmaToken', proxy: {}}))
  removeRewire.__Rewire__('storeRuntimeConfig', stub().resolves())
  removeRewire.__Rewire__('success', stub())
})

test.afterEach(() => {
  removeRewire.__ResetDependency__('getContext')
  removeRewire.__ResetDependency__('setContext')
  removeRewire.__ResetDependency__('getContext')
  removeRewire.__ResetDependency__('storeRuntimeConfig')
})

test('config remove command', async (t) => {
  await removeHandler({proxy: true})
  t.deepEqual(setContextStub.args[0][0], {cmaToken: 'cmaToken'})
})
