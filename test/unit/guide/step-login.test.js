import { stub } from 'sinon'

import loginStep,
{ __RewireAPI__ as loginStepRewireApi } from '../../../lib/guide/step-login'

const loginStub = stub().resolves()
const getContextStub = stub().resolves({cmaToken: 'blah'})

beforeAll(() => {
  loginStepRewireApi.__Rewire__('login', loginStub)
  loginStepRewireApi.__Rewire__('getContext', getContextStub)
  loginStepRewireApi.__Rewire__('wrappedLog', stub())
  loginStepRewireApi.__Rewire__('log', stub())
})

afterEach(() => {
  loginStub.resetHistory()
  getContextStub.resetHistory()
})

afterAll(() => {
  loginStepRewireApi.__ResetDependency__('login')
  loginStepRewireApi.__ResetDependency__('getContext')
  loginStepRewireApi.__ResetDependency__('wrappedLog')
  loginStepRewireApi.__ResetDependency__('log')
})

test('do not login if cmaToken already exists in context', async () => {
  await loginStep({})
  expect(getContextStub.calledOnce).toBe(true)
  expect(loginStub.callCount).toBe(0)
})

test(
  'login and increment stepCount if cmaToken does not exist in context',
  async () => {
    getContextStub.resolves({})
    const stepCount = 0
    const guideContext = { stepCount }
    await loginStep(guideContext)
    expect(getContextStub.calledOnce).toBe(true)
    expect(loginStub.calledOnce).toBe(true)
    expect(guideContext.stepCount).toBe(stepCount + 1)
  }
)
