import test from 'ava'
import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  handler as loginHandler,
  __RewireAPI__ as loginRewireAPI
} from '../../../lib/cmds/login'
import {
  emptyContext,
  __RewireAPI__ as contextRewireAPI
} from '../../../lib/context'

const promptStub = stub(inquirer, 'prompt')
const opnStub = stub()
const writeFileStub = stub()

const enoent = new Error()
enoent.code = 'ENOENT'
const readFileStub = stub().rejects(enoent)
const confirmationStub = stub().resolves(true)

test.before(() => {
  loginRewireAPI.__Rewire__('inquirer', inquirer)
  loginRewireAPI.__Rewire__('confirmation', confirmationStub)
  loginRewireAPI.__Rewire__('opn', opnStub)
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

test.after.always(() => {
  loginRewireAPI.__ResetDependency__('inquirer')
  loginRewireAPI.__ResetDependency__('confirmation')
  loginRewireAPI.__ResetDependency__('opn')
  contextRewireAPI.__ResetDependency__('readFile')
  contextRewireAPI.__ResetDependency__('writeFile')
})

test.afterEach((t) => {
  confirmationStub.resetHistory()
  promptStub.resetHistory()
  opnStub.resetHistory()
  readFileStub.resetHistory()
  writeFileStub.resetHistory()
})

test.serial('login - without error', async (t) => {
  const mockedRcConfig = {
    cmaToken: 'mockedToken'
  }
  promptStub.returns(mockedRcConfig)
  const setContextStub = stub().resolves(true)
  loginRewireAPI.__Rewire__('setContext', setContextStub)

  await loginHandler()

  t.true(confirmationStub.calledOnce, 'called confirmation')
  t.true(setContextStub.called, 'setContext called')
  t.deepEqual(setContextStub.args[0][0], mockedRcConfig)
  loginRewireAPI.__ResetDependency__('setContext')
})

test.serial('login - user abort', async (t) => {
  confirmationStub.resolves(false)

  emptyContext()
  await loginHandler()

  t.true(readFileStub.called, 'did load rc config')
  t.true(confirmationStub.called, 'called confirmation')
  // this depends on process.platform
  // t.true(opnStub.notCalled, 'did not try to open a browser')
  t.true(writeFileStub.notCalled, 'did not try to store rc')
  confirmationStub.resolves(true)
})

test.serial('login - already logged in', async (t) => {
  loginRewireAPI.__Rewire__('getContext', stub().resolves({cmaToken: 'alreadyLoggedIn'}))
  await loginHandler()

  t.true(readFileStub.notCalled, 'did not try to load rc config')
  t.true(opnStub.notCalled, 'did not try to open a browser')
  t.true(writeFileStub.notCalled, 'did not try to store rc')
  t.true(promptStub.notCalled, 'did not show any inquirer')
  loginRewireAPI.__ResetDependency__('getContext')
})
