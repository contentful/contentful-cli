import { addHandler, __RewireAPI__ as addRewire } from '../../../../lib/cmds/config_cmds/add'
import { stub } from 'sinon'

const setContextStub = stub()
beforeEach(() => {
  addRewire.__Rewire__('getContext', stub())
  addRewire.__Rewire__('setContext', setContextStub)
  addRewire.__Rewire__('getContext', stub().resolves({}))
  addRewire.__Rewire__('storeRuntimeConfig', stub().resolves())
  addRewire.__Rewire__('success', stub())
})

afterEach(() => {
  addRewire.__ResetDependency__('getContext')
  addRewire.__ResetDependency__('setContext')
  addRewire.__ResetDependency__('getContext')
  addRewire.__ResetDependency__('storeRuntimeConfig')
})

test('config add command', async () => {
  await addHandler({proxy: 'user:password@host:8080'})
  const expectedProxy = {
    host: 'host',
    port: 8080,
    isHttps: false,
    auth: {
      username: 'user',
      password: 'password'
    }
  }
  expect(setContextStub.args[0][0].proxy).toEqual(expectedProxy)
})
