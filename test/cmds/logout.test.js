import test from 'ava'
import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  logout,
  __RewireAPI__ as logoutRewireAPI
} from '../../lib/cmds/logout'
import {
  __RewireAPI__ as actionsRewireAPI
} from '../../lib/utils/actions'
import {
  emptyContext,
  setContext,
  getContext,
  __RewireAPI__ as contextRewireAPI
} from '../../lib/context'
import { PreconditionFailedError } from '../../lib/utils/error'

const promptStub = stub(inquirer, 'prompt')
const writeFileStub = stub()
const logStub = stub()
const warningStub = stub()
const successStub = stub()

test.before(() => {
  actionsRewireAPI.__Rewire__('inquirer', inquirer)
  logoutRewireAPI.__Rewire__('log', logStub)
  logoutRewireAPI.__Rewire__('success', successStub)
  logoutRewireAPI.__Rewire__('warning', warningStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

test.after.always(() => {
  actionsRewireAPI.__ResetDependency__('inquirer')
  logoutRewireAPI.__ResetDependency__('log')
  logoutRewireAPI.__ResetDependency__('success')
  logoutRewireAPI.__ResetDependency__('warning')
  contextRewireAPI.__ResetDependency__('writeFile')
})

test.afterEach((t) => {
  promptStub.resetHistory()
  logStub.resetHistory()
  successStub.resetHistory()
  warningStub.resetHistory()
  writeFileStub.resetHistory()
})

test.serial('logout fails when not logged in', async (t) => {
  emptyContext()
  setContext({})
  const error = await t.throws(logout({}), PreconditionFailedError, 'throws precondition failed error')
  t.truthy(error.message.includes('You have to be logged in to do this'), 'throws not logged in error')
  t.is(warningStub.callCount, 0, 'does not display warning')
  t.is(promptStub.callCount, 0, 'does not ask user')
  t.is(successStub.callCount, 0, 'does not display success message')
  t.is(logStub.callCount, 0, 'does not display abort message')
  t.is(writeFileStub.callCount, 0, 'nothing was written to the file system')
})

test.serial('logout is actually logging out', async (t) => {
  promptStub.onCall(0).returns({ready: true})
  emptyContext()
  setContext({ cmaToken: 'mockedToken' })
  await logout({})
  const context = await getContext()
  t.is(warningStub.callCount, 1, 'warns user that his token gets removed')
  t.is(promptStub.callCount, 1, 'asks once if it should log out')
  t.is(successStub.callCount, 1, 'display success message')
  t.is(logStub.callCount, 0, 'does not display abort message')
  t.falsy(context.cmaToken, 'token got removed from context')
  t.is(writeFileStub.args[0][1], JSON.stringify({ cmaToken: null }, null, 2) + '\n', 'stores rc file without token')
})

test.serial('logout is abortable', async (t) => {
  promptStub.onCall(0).returns({ready: false})
  emptyContext()
  setContext({ cmaToken: 'mockedToken' })
  await logout({})
  const context = await getContext()
  t.is(warningStub.callCount, 1, 'warns user that his token gets removed')
  t.is(promptStub.callCount, 1, 'asks once if it should log out')
  t.is(successStub.callCount, 0, 'does not display success message')
  t.is(writeFileStub.callCount, 0, 'nothing was written to the file system')
  t.is(logStub.callCount, 1, 'does display abort message')
  t.truthy(context.cmaToken, 'token still exists in context')
})
