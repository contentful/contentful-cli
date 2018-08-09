import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  logout,
  __RewireAPI__ as logoutRewireAPI
} from '../../../lib/cmds/logout'
import {
  __RewireAPI__ as actionsRewireAPI
} from '../../../lib/utils/actions'
import {
  emptyContext,
  setContext,
  getContext,
  __RewireAPI__ as contextRewireAPI
} from '../../../lib/context'
import { PreconditionFailedError } from '../../../lib/utils/error'

const promptStub = stub(inquirer, 'prompt')
const writeFileStub = stub()
const logStub = stub()
const warningStub = stub()
const successStub = stub()

beforeAll(() => {
  actionsRewireAPI.__Rewire__('inquirer', inquirer)
  logoutRewireAPI.__Rewire__('log', logStub)
  logoutRewireAPI.__Rewire__('success', successStub)
  logoutRewireAPI.__Rewire__('warning', warningStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

afterAll(() => {
  actionsRewireAPI.__ResetDependency__('inquirer')
  logoutRewireAPI.__ResetDependency__('log')
  logoutRewireAPI.__ResetDependency__('success')
  logoutRewireAPI.__ResetDependency__('warning')
  contextRewireAPI.__ResetDependency__('writeFile')
})

afterEach(() => {
  promptStub.resetHistory()
  logStub.resetHistory()
  successStub.resetHistory()
  warningStub.resetHistory()
  writeFileStub.resetHistory()
})

test('logout fails when not logged in', async () => {
  emptyContext()
  setContext({})
  try {
    await expect(logout({})).rejects.toThrowError(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You have to be logged in to do this')).toBeTruthy()
    expect(warningStub.callCount).toBe(0)
    expect(promptStub.callCount).toBe(0)
    expect(successStub.callCount).toBe(0)
    expect(logStub.callCount).toBe(0)
    expect(writeFileStub.callCount).toBe(0)
  }
})

test('logout is actually logging out', async () => {
  promptStub.onCall(0).returns({ready: true})
  emptyContext()
  setContext({ cmaToken: 'mockedToken' })
  await logout({})
  const context = await getContext()
  expect(warningStub.callCount).toBe(1)
  expect(promptStub.callCount).toBe(1)
  expect(successStub.callCount).toBe(1)
  expect(logStub.callCount).toBe(0)
  expect(context.cmaToken).toBeFalsy()
  expect(writeFileStub.args[0][1]).toBe(JSON.stringify({ cmaToken: null }, null, 2) + '\n')
})

test('logout is abortable', async () => {
  promptStub.onCall(0).returns({ready: false})
  emptyContext()
  setContext({ cmaToken: 'mockedToken' })
  await logout({})
  const context = await getContext()
  expect(warningStub.callCount).toBe(1)
  expect(promptStub.callCount).toBe(1)
  expect(successStub.callCount).toBe(0)
  expect(writeFileStub.callCount).toBe(0)
  expect(logStub.callCount).toBe(1)
  expect(context.cmaToken).toBeTruthy()
})
