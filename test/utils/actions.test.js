import test from 'ava'
import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  confirmation,
  reoccurringConfirmation,
  __RewireAPI__ as actionsRewireAPI
} from '../../lib/utils/actions'

const promptStub = stub(inquirer, 'prompt')

test.before(() => {
  actionsRewireAPI.__Rewire__('inquirer', inquirer)
})

test.after.always(() => {
  actionsRewireAPI.__ResetDependency__('inquirer')
})

test.afterEach((t) => {
  promptStub.reset()
})

test.serial('confirmation continues after user accepted', async (t) => {
  promptStub.onCall(0).resolves({ ready: true })
  const confirmationResult = await confirmation()
  t.is(promptStub.callCount, 1, 'question was asked once')
  t.true(confirmationResult, 'returns true when user accepted')
})

test.serial('confirmation is asked again when user denies', async (t) => {
  promptStub.onCall(0).resolves({ ready: false })
  const confirmationResult = await confirmation()
  t.is(promptStub.callCount, 1, 'question was asked twice')
  t.false(confirmationResult, 'returns false when user declined')
})

test.serial('recurring confirmation continues after user accepted', async (t) => {
  promptStub.onCall(0).resolves({ ready: true })
  await reoccurringConfirmation()
  t.is(promptStub.callCount, 1, 'question was asked once')
})

test.serial('recurring confirmation is asked again when user denies', async (t) => {
  promptStub.onCall(0).resolves({ ready: false })
  promptStub.onCall(1).resolves({ ready: true })
  await reoccurringConfirmation()
  t.is(promptStub.callCount, 2, 'question was asked twice')
})
