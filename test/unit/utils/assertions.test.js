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

beforeAll(() => {
  assertionsRewireAPI.__Rewire__('highlightStyle', highlightStyleSpy)
})

afterAll(() => {
  assertionsRewireAPI.__ResetDependency__('highlightStyle')
})

afterEach(() => {
  highlightStyleSpy.resetHistory()
})

test('assertLoggedIn when not logged in', async () => {
  await emptyContext()
  await setContext({})
  try {
    await expect(assertLoggedIn()).rejects.toThrowError(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You have to be logged in to do this')).toBeTruthy()
  }
})

test('assertLoggedIn when logged in', async () => {
  await emptyContext()
  await setContext({
    cmaToken: 'mocked token'
  })
  await expect(assertLoggedIn).not.toThrowError('does not throw error ')
})

test('assertSpaceIdProvided when provided via args', async () => {
  await emptyContext()
  await setContext({})
  await expect(() => assertSpaceIdProvided({
    spaceId: 'mocked spaceId'
  })).not.toThrowError('does not throw error ')
})

test('assertSpaceIdProvided when provided via context', async () => {
  await emptyContext()
  await setContext({
    activeSpaceId: 'mocked spaceId'
  })
  await expect(assertSpaceIdProvided).not.toThrowError('does not throw error ')
})

test('assertSpaceIdProvided when not provided at all', async () => {
  await emptyContext()
  await setContext({})
  try {
    await expect(assertSpaceIdProvided({})).rejects.toThrowError(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You need to provide a space id')).toBeTruthy()
  }
})
