import { spy } from 'sinon'

import {
  log,
  wrappedLog,
  warning,
  success,
  error,
  logError,
  __RewireAPI__ as logRewireAPI
} from '../../../lib/utils/log'
import { infoStyle, warningStyle, errorStyle, successStyle } from '../../../lib/utils/styles'
import { frame, wrap } from '../../../lib/utils/text'
import { PreconditionFailedError } from '../../../lib/utils/error'

const infoStyleSpy = spy(infoStyle)
const warningStyleSpy = spy(warningStyle)
const errorStyleSpy = spy(errorStyle)
const successStyleSpy = spy(successStyle)
const frameSpy = spy(frame)
const wrapSpy = spy(wrap)

beforeAll(() => {
  logRewireAPI.__Rewire__('infoStyle', infoStyleSpy)
  logRewireAPI.__Rewire__('warningStyle', warningStyleSpy)
  logRewireAPI.__Rewire__('errorStyle', errorStyleSpy)
  logRewireAPI.__Rewire__('successStyle', successStyleSpy)
  logRewireAPI.__Rewire__('frame', frameSpy)
  logRewireAPI.__Rewire__('wrap', wrapSpy)
})

afterAll(() => {
  logRewireAPI.__ResetDependency__('infoStyle')
  logRewireAPI.__ResetDependency__('warningStyle')
  logRewireAPI.__ResetDependency__('errorStyle')
  logRewireAPI.__ResetDependency__('successStyle')
  logRewireAPI.__ResetDependency__('frame')
  logRewireAPI.__ResetDependency__('wrap')
})

afterEach(() => {
  infoStyleSpy.resetHistory()
  warningStyleSpy.resetHistory()
  errorStyleSpy.resetHistory()
  successStyleSpy.resetHistory()
  frameSpy.resetHistory()
  wrapSpy.resetHistory()
})

test('log', () => {
  log('arg1', 'arg2')
  expect(infoStyleSpy.callCount).toBe(0)
  expect(warningStyleSpy.callCount).toBe(0)
  expect(errorStyleSpy.callCount).toBe(0)
  expect(successStyleSpy.callCount).toBe(0)
  expect(wrapSpy.callCount).toBe(0)
  expect(frameSpy.callCount).toBe(0)
})

test('wrappedLog', () => {
  wrappedLog('arg1')
  expect(infoStyleSpy.callCount).toBe(0)
  expect(warningStyleSpy.callCount).toBe(0)
  expect(errorStyleSpy.callCount).toBe(0)
  expect(successStyleSpy.callCount).toBe(0)
  expect(wrapSpy.callCount).toBe(1)
  expect(frameSpy.callCount).toBe(0)

  wrappedLog('arg1', 10)
  expect(wrapSpy.callCount).toBe(2)
  expect(wrapSpy.calledWith('arg1', 10)).toBe(true)
})

test('warning', () => {
  warning('arg1', 'arg2')
  expect(infoStyleSpy.callCount).toBe(0)
  expect(warningStyleSpy.callCount).toBe(2)
  expect(errorStyleSpy.callCount).toBe(0)
  expect(successStyleSpy.callCount).toBe(0)
  expect(wrapSpy.callCount).toBe(0)
  expect(frameSpy.callCount).toBe(0)
})

test('error', () => {
  error('arg1', 'arg2')
  expect(infoStyleSpy.callCount).toBe(0)
  expect(warningStyleSpy.callCount).toBe(0)
  expect(errorStyleSpy.callCount).toBe(2)
  expect(successStyleSpy.callCount).toBe(0)
  expect(wrapSpy.callCount).toBe(0)
  expect(frameSpy.callCount).toBe(0)
})

test('success', () => {
  success('arg1', 'arg2')
  expect(infoStyleSpy.callCount).toBe(0)
  expect(warningStyleSpy.callCount).toBe(0)
  expect(errorStyleSpy.callCount).toBe(0)
  expect(successStyleSpy.callCount).toBe(2)
  expect(wrapSpy.callCount).toBe(0)
  expect(frameSpy.callCount).toBe(0)
})

test('logError - SDK error', () => {
  const error = new Error()
  error.message = JSON.stringify({message: 'Some error from the SDK', data: { foo: { bar: ['some', 'data'] } }})
  logError(error)
  expect(errorStyleSpy.callCount).toBe(1)
  expect(wrapSpy.callCount).toBe(1)
  expect(frameSpy.callCount).toBe(1)
})

test('logError - non SDK error', () => {
  const error = new Error('Some non SDK error without stack')
  delete error.stack
  logError(error)
  expect(errorStyleSpy.callCount).toBe(1)
  expect(wrapSpy.callCount).toBe(1)
  expect(frameSpy.callCount).toBe(0)
})

test('logError - runtime error', () => {
  const error = new Error('Some runtime error')
  logError(error)
  expect(errorStyleSpy.callCount).toBe(1)
  expect(wrapSpy.callCount).toBe(1)
  expect(frameSpy.callCount).toBe(1)
})

test('logError - precondition failed', () => {
  const error = new PreconditionFailedError('Some precondition error')
  logError(error)
  expect(errorStyleSpy.callCount).toBe(1)
  expect(wrapSpy.callCount).toBe(1)
  expect(frameSpy.callCount).toBe(0)
})
