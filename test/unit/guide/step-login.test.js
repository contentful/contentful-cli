import test from 'ava'
import { stub } from 'sinon'

import loginStep,
{ __RewireAPI__ as loginStepRewireApi } from '../../../lib/guide/step-login'

const loginStub = stub().resolves()
const getContextStub = stub().resolves({cmaToken: 'blah'})

test.before(() => {
  loginStepRewireApi.__Rewire__('login', loginStub)
  loginStepRewireApi.__Rewire__('getContext', getContextStub)
  loginStepRewireApi.__Rewire__('wrappedLog', stub())
  loginStepRewireApi.__Rewire__('log', stub())
})

test.afterEach(() => {
  loginStub.resetHistory()
  getContextStub.resetHistory()
})

test.after.always(() => {
  loginStepRewireApi.__ResetDependency__('login')
  loginStepRewireApi.__ResetDependency__('getContext')
  loginStepRewireApi.__ResetDependency__('wrappedLog')
  loginStepRewireApi.__ResetDependency__('log')
})

test.serial('do not login if cmaToken already exists in context', async (t) => {
  await loginStep({})
  t.true(getContextStub.calledOnce, 'getContext is called')
  t.is(loginStub.callCount, 0, 'login not called')
})

test.serial('login and increment stepCount if cmaToken does not exist in context', async (t) => {
  getContextStub.resolves({})
  const stepCount = 0
  const guideContext = { stepCount }
  await loginStep(guideContext)
  t.true(getContextStub.calledOnce, 'getContext called')
  t.true(loginStub.calledOnce, 'login called')
  t.is(guideContext.stepCount, stepCount + 1, 'guideContext stepCount was incremented')
})
