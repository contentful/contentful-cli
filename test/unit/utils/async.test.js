import { stub, spy } from 'sinon'

import { handleAsyncError } from '../../../lib/utils/async'

const exitStub = stub()
let originalExit = null

beforeAll(() => {
  originalExit = global.process.exit
  global.process.exit = exitStub
})

afterAll(() => {
  global.process.exit = originalExit
})

test('handleAsyncError (success)', async () => {
  const asyncFn = stub().resolves('value')
  const errorHandler = spy()

  const handlerFn = handleAsyncError(asyncFn, errorHandler)
  expect(typeof handlerFn).toBe('function')

  const handlerValue = handlerFn({ value: 'foo' })
  expect(handlerValue instanceof Promise).toBe(true)

  const returnValue = await handlerValue
  expect(returnValue).toBe('value')

  expect(errorHandler.notCalled).toBe(true)
})

test('handleAsyncError (failure)', async () => {
  const error = new Error('error message')
  const asyncFn = stub().rejects(error)
  const errorHandler = spy()

  const handlerFn = handleAsyncError(asyncFn, errorHandler)
  expect(typeof handlerFn).toBe('function')

  const handlerValue = handlerFn({ value: 'foo' })
  expect(() => handlerFn({ value: 'foo' })).not.toThrow()
  expect(handlerValue instanceof Promise).toBe(true)

  await handlerValue

  expect(errorHandler.callCount > 0).toBe(true)
  expect(errorHandler.calledWith(error)).toBe(true)

  expect(exitStub.callCount > 0).toBe(true)
  expect(exitStub.calledWith(1)).toBe(true)
})
