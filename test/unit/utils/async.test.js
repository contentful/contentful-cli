const { handleAsyncError } = require('../../../lib/utils/async')

const exitStub = jest.fn()
let originalExit = null

beforeAll(() => {
  originalExit = global.process.exit
  global.process.exit = exitStub
})

afterAll(() => {
  global.process.exit = originalExit
})

test('handleAsyncError (success)', async () => {
  const asyncFn = jest.fn().mockResolvedValue('value')
  const errorHandler = jest.fn()

  const handlerFn = handleAsyncError(asyncFn, errorHandler)
  expect(typeof handlerFn).toBe('function')

  const handlerValue = handlerFn({ value: 'foo' })

  const returnValue = await handlerValue
  expect(returnValue).toBe('value')

  expect(errorHandler).not.toHaveBeenCalled()
})

test('handleAsyncError (failure)', async () => {
  const error = new Error('error message')
  const asyncFn = jest.fn().mockRejectedValue(error)
  const errorHandler = jest.fn()

  const handlerFn = handleAsyncError(asyncFn, errorHandler)
  expect(typeof handlerFn).toBe('function')

  const handlerValue = handlerFn({ value: 'foo' })

  await handlerValue

  expect(errorHandler).toHaveBeenCalled()
  expect(errorHandler).toHaveBeenCalledWith(error)

  expect(exitStub).toHaveBeenCalled()
  expect(exitStub).toHaveBeenCalledWith(1)
})
