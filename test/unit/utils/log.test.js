import test from 'ava'
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

test.before(() => {
  logRewireAPI.__Rewire__('infoStyle', infoStyleSpy)
  logRewireAPI.__Rewire__('warningStyle', warningStyleSpy)
  logRewireAPI.__Rewire__('errorStyle', errorStyleSpy)
  logRewireAPI.__Rewire__('successStyle', successStyleSpy)
  logRewireAPI.__Rewire__('frame', frameSpy)
  logRewireAPI.__Rewire__('wrap', wrapSpy)
})

test.after.always(() => {
  logRewireAPI.__ResetDependency__('infoStyle')
  logRewireAPI.__ResetDependency__('warningStyle')
  logRewireAPI.__ResetDependency__('errorStyle')
  logRewireAPI.__ResetDependency__('successStyle')
  logRewireAPI.__ResetDependency__('frame')
  logRewireAPI.__ResetDependency__('wrap')
})

test.afterEach((t) => {
  infoStyleSpy.resetHistory()
  warningStyleSpy.resetHistory()
  errorStyleSpy.resetHistory()
  successStyleSpy.resetHistory()
  frameSpy.resetHistory()
  wrapSpy.resetHistory()
})

test('log', (t) => {
  log('arg1', 'arg2')
  t.is(infoStyleSpy.callCount, 0, 'infoStyle was not applied')
  t.is(warningStyleSpy.callCount, 0, 'warningStyle was not applied')
  t.is(errorStyleSpy.callCount, 0, 'errorStyle was not applied')
  t.is(successStyleSpy.callCount, 0, 'successStyle was not applied')
  t.is(wrapSpy.callCount, 0, 'content was not wrapped')
  t.is(frameSpy.callCount, 0, 'content was not framed')
})

test('wrappedLog', (t) => {
  wrappedLog('arg1')
  t.is(infoStyleSpy.callCount, 0, 'infoStyle was not applied')
  t.is(warningStyleSpy.callCount, 0, 'warningStyle was not applied')
  t.is(errorStyleSpy.callCount, 0, 'errorStyle was not applied')
  t.is(successStyleSpy.callCount, 0, 'successStyle was not applied')
  t.is(wrapSpy.callCount, 1, 'content was wrapped')
  t.is(frameSpy.callCount, 0, 'content was not framed')

  wrappedLog('arg1', 10)
  t.is(wrapSpy.callCount, 2, 'content was wrapped again')
  t.true(wrapSpy.calledWith('arg1', 10), 'content was wrapped with given length')
})

test('warning', (t) => {
  warning('arg1', 'arg2')
  t.is(infoStyleSpy.callCount, 0, 'infoStyle was not applied')
  t.is(warningStyleSpy.callCount, 2, 'warningStyle was applied twice')
  t.is(errorStyleSpy.callCount, 0, 'errorStyle was not applied')
  t.is(successStyleSpy.callCount, 0, 'successStyle was not applied')
  t.is(wrapSpy.callCount, 0, 'content was not wrapped')
  t.is(frameSpy.callCount, 0, 'content was not framed')
})

test('error', (t) => {
  error('arg1', 'arg2')
  t.is(infoStyleSpy.callCount, 0, 'infoStyle was not applied')
  t.is(warningStyleSpy.callCount, 0, 'warningStyle was not applied')
  t.is(errorStyleSpy.callCount, 2, 'errorStyle was applied twice')
  t.is(successStyleSpy.callCount, 0, 'successStyle was not applied')
  t.is(wrapSpy.callCount, 0, 'content was not wrapped')
  t.is(frameSpy.callCount, 0, 'content was not framed')
})

test('success', (t) => {
  success('arg1', 'arg2')
  t.is(infoStyleSpy.callCount, 0, 'infoStyle was not applied')
  t.is(warningStyleSpy.callCount, 0, 'warningStyle was not applied')
  t.is(errorStyleSpy.callCount, 0, 'errorStyle was not applied')
  t.is(successStyleSpy.callCount, 2, 'successStyle was applied twice')
  t.is(wrapSpy.callCount, 0, 'content was not wrapped')
  t.is(frameSpy.callCount, 0, 'content was not framed')
})

test('logError - SDK error', (t) => {
  const error = new Error()
  error.message = JSON.stringify({message: 'Some error from the SDK', data: { foo: { bar: ['some', 'data'] } }})
  logError(error)
  t.is(errorStyleSpy.callCount, 1, 'error message was styled as an error')
  t.is(wrapSpy.callCount, 1, 'error message was wrapped')
  t.is(frameSpy.callCount, 1, 'error was output in a frame')
})

test('logError - non SDK error', (t) => {
  const error = new Error('Some non SDK error without stack')
  delete error.stack
  logError(error)
  t.is(errorStyleSpy.callCount, 1, 'error message was styled as an error')
  t.is(wrapSpy.callCount, 1, 'error message was wrapped')
  t.is(frameSpy.callCount, 0, 'error was output in a frame')
})

test('logError - runtime error', (t) => {
  const error = new Error('Some runtime error')
  logError(error)
  t.is(errorStyleSpy.callCount, 1, 'error message was styled as an error')
  t.is(wrapSpy.callCount, 1, 'error message was wrapped')
  t.is(frameSpy.callCount, 1, 'error was output in a frame')
})

test('logError - precondition failed', (t) => {
  const error = new PreconditionFailedError('Some precondition error')
  logError(error)
  t.is(errorStyleSpy.callCount, 1, 'error message was styled as an error')
  t.is(wrapSpy.callCount, 1, 'error message was wrapped')
  t.is(frameSpy.callCount, 0, 'error was output in a frame')
})
