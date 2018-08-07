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

beforeAll(() => {
  loginRewireAPI.__Rewire__('inquirer', inquirer)
  loginRewireAPI.__Rewire__('confirmation', confirmationStub)
  loginRewireAPI.__Rewire__('opn', opnStub)
  loginRewireAPI.__Rewire__('setContext', setContextStub)
  loginRewireAPI.__Rewire__('getContext', getContextStub)
  loginRewireAPI.__Rewire__('storeRuntimeConfig', stub())
})

afterAll(() => {
  loginRewireAPI.__ResetDependency__('inquirer')
  loginRewireAPI.__ResetDependency__('confirmation')
  loginRewireAPI.__ResetDependency__('opn')
  loginRewireAPI.__ResetDependency__('setContext')
  loginRewireAPI.__ResetDependency__('getContext')
  loginRewireAPI.__ResetDependency__('storeRuntimeConfig')
})

afterEach(() => {
  confirmationStub.resetHistory()
  promptStub.resetHistory()
  opnStub.resetHistory()
  setContextStub.resetHistory()
  getContextStub.resetHistory()
})

test('login - without error', async () => {
  await loginHandler()

  expect(confirmationStub.calledOnce).toBe(true)
  expect(setContextStub.called).toBe(true)
  expect(setContextStub.args[0][0]).toEqual(mockedRcConfig)
})

test('login - user abort', async () => {
  confirmationStub.resolves(false)

  await loginHandler()

  expect(getContextStub.called).toBe(true)
  expect(confirmationStub.called).toBe(true)
  // this depends on process.platform
  // t.true(opnStub.notCalled, 'did not try to open a browser')
  expect(setContextStub.notCalled).toBe(true)
  confirmationStub.resolves(true)
})

test('login - already logged in', async () => {
  getContextStub.resolves({cmaToken: 'alreadyLoggedIn'})
  await loginHandler()

  expect(opnStub.notCalled).toBe(true)
  expect(setContextStub.notCalled).toBe(true)
  expect(promptStub.notCalled).toBe(true)
})
