import test from 'ava'
import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  handler as loginHandler,
  __RewireAPI__ as loginRewireAPI
} from '../../../lib/cmds/login'
const mockedRcConfig = {
  cmaToken: 'mockedToken'
}
const promptStub = stub(inquirer, 'prompt').returns(mockedRcConfig)
const opnStub = stub()
const setContextStub = stub().resolves(true)
const getContextStub = stub().resolves({cmaToken: false})

const confirmationStub = stub().resolves(true)

test.before(() => {
  loginRewireAPI.__Rewire__('inquirer', inquirer)
  loginRewireAPI.__Rewire__('confirmation', confirmationStub)
  loginRewireAPI.__Rewire__('opn', opnStub)
  loginRewireAPI.__Rewire__('setContext', setContextStub)
  loginRewireAPI.__Rewire__('getContext', getContextStub)
  loginRewireAPI.__Rewire__('storeRuntimeConfig', stub())
})

test.after.always(() => {
  loginRewireAPI.__ResetDependency__('inquirer')
  loginRewireAPI.__ResetDependency__('confirmation')
  loginRewireAPI.__ResetDependency__('opn')
  loginRewireAPI.__ResetDependency__('setContext')
  loginRewireAPI.__ResetDependency__('getContext')
  loginRewireAPI.__ResetDependency__('storeRuntimeConfig')
})

test.afterEach((t) => {
  confirmationStub.resetHistory()
  promptStub.resetHistory()
  opnStub.resetHistory()
  setContextStub.resetHistory()
  getContextStub.resetHistory()
})

test.serial('login - without error', async (t) => {
  await loginHandler()

  t.true(confirmationStub.calledOnce, 'called confirmation')
  t.true(setContextStub.called, 'setContext called')
  t.deepEqual(setContextStub.args[0][0], mockedRcConfig)
})

test.serial('login - user abort', async (t) => {
  confirmationStub.resolves(false)

  await loginHandler()

  t.true(getContextStub.called, 'did call getContext for rc')
  t.true(confirmationStub.called, 'called confirmation')
  // this depends on process.platform
  // t.true(opnStub.notCalled, 'did not try to open a browser')
  t.true(setContextStub.notCalled, 'did not call setContext to store rc')
  confirmationStub.resolves(true)
})

test.serial('login - already logged in', async (t) => {
  getContextStub.resolves({cmaToken: 'alreadyLoggedIn'})
  await loginHandler()

  t.true(opnStub.notCalled, 'did not try to open a browser')
  t.true(setContextStub.notCalled, 'did not try to setContext to store rc')
  t.true(promptStub.notCalled, 'did not show any inquirer')
})
