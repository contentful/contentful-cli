import test from 'ava'
import { stub, spy } from 'sinon'

import { handleAsyncError } from '../../../lib/utils/async'

const exitStub = stub()
let originalExit = null

test.before(() => {
  originalExit = global.process.exit
  global.process.exit = exitStub
})

test.after.always(() => {
  global.process.exit = originalExit
})

test('handleAsyncError (success)', async (t) => {
  const asyncFn = stub().resolves('value')
  const errorHandler = spy()

  const handlerFn = handleAsyncError(asyncFn, errorHandler)
  t.is(typeof handlerFn, 'function', 'handleAsyncError is a HOF')

  const handlerValue = handlerFn({ value: 'foo' })
  t.true(handlerValue instanceof Promise)

  const returnValue = await handlerValue
  t.is(returnValue, 'value', 'passes back promise value')

  t.true(errorHandler.notCalled)
})

test('handleAsyncError (failure)', async (t) => {
  const error = new Error('error message')
  const asyncFn = stub().rejects(error)
  const errorHandler = spy()

  const handlerFn = handleAsyncError(asyncFn, errorHandler)
  t.is(typeof handlerFn, 'function', 'handleAsyncError is a HOF')

  const handlerValue = handlerFn({ value: 'foo' })
  t.true(handlerValue instanceof Promise)
  t.notThrows(handlerValue)

  await handlerValue

  t.true(errorHandler.calledOnce)
  t.true(errorHandler.calledWith(error))

  t.true(exitStub.calledOnce)
  t.true(exitStub.calledWith(1))
})
