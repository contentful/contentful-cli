import test from 'ava'
import { spy } from 'sinon'

import {
  assertLoggedIn,
  assertSpaceIdProvided,
  __RewireAPI__ as assertionsRewireAPI
} from '../../../lib/utils/assertions'
import {
  emptyContext,
  setContext
} from '../../../lib/context'
import { PreconditionFailedError } from '../../../lib/utils/error'

const highlightStyleSpy = spy()

test.before(() => {
  assertionsRewireAPI.__Rewire__('highlightStyle', highlightStyleSpy)
})

test.after.always(() => {
  assertionsRewireAPI.__ResetDependency__('highlightStyle')
})

test.afterEach((t) => {
  highlightStyleSpy.resetHistory()
})

test.serial('assertLoggedIn when not logged in', async (t) => {
  await emptyContext()
  await setContext({})
  const error = await t.throws(assertLoggedIn(), PreconditionFailedError, 'throws precondition failed error')
  t.truthy(error.message.includes('You have to be logged in to do this'), 'error message contains not logged in message')
})

test.serial('assertLoggedIn when logged in', async (t) => {
  await emptyContext()
  await setContext({
    cmaToken: 'mocked token'
  })
  await t.notThrows(assertLoggedIn(), 'does not throw error ')
})

test.serial('assertSpaceIdProvided when provided via args', async (t) => {
  await emptyContext()
  await setContext({})
  await t.notThrows(assertSpaceIdProvided({
    spaceId: 'mocked spaceId'
  }), 'does not throw error ')
})

test.serial('assertSpaceIdProvided when provided via context', async (t) => {
  await emptyContext()
  await setContext({
    activeSpaceId: 'mocked spaceId'
  })
  await t.notThrows(assertSpaceIdProvided({}), 'does not throw error ')
})

test.serial('assertSpaceIdProvided when not provided at all', async (t) => {
  await emptyContext()
  await setContext({})
  const error = await t.throws(assertSpaceIdProvided({}), PreconditionFailedError, 'throws precondition failed error')
  t.truthy(error.message.includes('You need to provide a space id'), 'error message contains space id missing text')
})
