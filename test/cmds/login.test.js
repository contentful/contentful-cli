import test from 'ava'
import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  handler as loginHandler,
  __RewireAPI__ as loginRewireAPI
} from '../../lib/cmds/login'
import {
  emptyContext,
  setContext,
  __RewireAPI__ as contextRewireAPI
} from '../../lib/context'

const promptStub = stub(inquirer, 'prompt')
const opnStub = stub()
const writeFileStub = stub()
const statStub = stub().rejects()

test.before(() => {
  loginRewireAPI.__Rewire__('inquirer', inquirer)
  loginRewireAPI.__Rewire__('opn', opnStub)
  contextRewireAPI.__Rewire__('stat', statStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

test.after.always(() => {
  loginRewireAPI.__ResetDependency__('inquirer')
  loginRewireAPI.__ResetDependency__('opn')
  contextRewireAPI.__ResetDependency__('stat')
  contextRewireAPI.__ResetDependency__('writeFile')
})

test.afterEach((t) => {
  promptStub.resetHistory()
  opnStub.resetHistory()
  statStub.resetHistory()
  writeFileStub.resetHistory()
})

test.serial('login - without error', async (t) => {
  promptStub.onCall(0).returns({ready: true})
  promptStub.onCall(1).returns({cmaToken: 'mockedToken'})

  emptyContext()
  await loginHandler()

  t.true(opnStub.calledOnce, 'opened the browser once')
  const mockedRcConfig = {
    cmaToken: 'mockedToken'
  }
  t.is(writeFileStub.args[0][1], JSON.stringify(mockedRcConfig, null, 2) + '\n', 'stores entered token')
})

test.serial('login - with retry', async (t) => {
  promptStub.onCall(0).returns({ready: false})
  promptStub.onCall(1).returns({ready: true})
  promptStub.onCall(2).returns({cmaToken: 'mockedToken'})

  emptyContext()
  await loginHandler()

  t.true(opnStub.calledOnce, 'opened the browser once')
  const mockedRcConfig = {
    cmaToken: 'mockedToken'
  }
  t.is(writeFileStub.args[0][1], JSON.stringify(mockedRcConfig, null, 2) + '\n', 'stores entered token')
})

test.serial('login - already logged in', async (t) => {
  setContext({cmaToken: 'alreadyLoggedIn'})
  await loginHandler()

  t.true(statStub.notCalled, 'did not try to load rc config')
  t.true(opnStub.notCalled, 'did not try to open a browser')
  t.true(writeFileStub.notCalled, 'did not try to store rc')
  t.true(promptStub.notCalled, 'did not show any inquirer')
})
