const {
  log,
  wrappedLog,
  warning,
  success,
  error,
  logError
} = require('../../../lib/utils/log')
const {
  infoStyle,
  warningStyle,
  errorStyle,
  successStyle
} = require('../../../lib/utils/styles')
const { frame, wrap } = require('../../../lib/utils/text')
const { PreconditionFailedError } = require('../../../lib/utils/error')

jest.mock('../../../lib/utils/styles', () => ({
  infoStyle: jest.fn(),
  warningStyle: jest.fn(),
  errorStyle: jest.fn(),
  successStyle: jest.fn()
}))
jest.mock('../../../lib/utils/text')

afterEach(() => {
  infoStyle.mockClear()
  warningStyle.mockClear()
  errorStyle.mockClear()
  successStyle.mockClear()
  frame.mockClear()
  wrap.mockClear()
})

test('log', () => {
  log('arg1', 'arg2')
  expect(infoStyle).not.toHaveBeenCalled()
  expect(warningStyle).not.toHaveBeenCalled()
  expect(errorStyle).not.toHaveBeenCalled()
  expect(successStyle).not.toHaveBeenCalled()
  expect(wrap).not.toHaveBeenCalled()
  expect(frame).not.toHaveBeenCalled()
})

test('wrappedLog', () => {
  wrappedLog('arg1')
  expect(infoStyle).not.toHaveBeenCalled()
  expect(warningStyle).not.toHaveBeenCalled()
  expect(errorStyle).not.toHaveBeenCalled()
  expect(successStyle).not.toHaveBeenCalled()
  expect(wrap).toHaveBeenCalledTimes(1)
  expect(frame).not.toHaveBeenCalled()

  wrappedLog('arg1', 10)
  expect(wrap).toHaveBeenCalledTimes(2)
  expect(wrap).toHaveBeenCalledWith('arg1', 10)
})

test('warning', () => {
  warning('arg1', 'arg2')
  expect(infoStyle).not.toHaveBeenCalled()
  expect(warningStyle).toHaveBeenCalledTimes(2)
  expect(errorStyle).not.toHaveBeenCalled()
  expect(successStyle).not.toHaveBeenCalled()
  expect(wrap).not.toHaveBeenCalled()
  expect(frame).not.toHaveBeenCalled()
})

test('error', () => {
  error('arg1', 'arg2')
  expect(infoStyle).not.toHaveBeenCalled()
  expect(warningStyle).not.toHaveBeenCalled()
  expect(errorStyle).toHaveBeenCalledTimes(2)
  expect(successStyle).not.toHaveBeenCalled()
  expect(wrap).not.toHaveBeenCalled()
  expect(frame).not.toHaveBeenCalled()
})

test('success', () => {
  success('arg1', 'arg2')
  expect(infoStyle).not.toHaveBeenCalled()
  expect(warningStyle).not.toHaveBeenCalled()
  expect(errorStyle).not.toHaveBeenCalled()
  expect(successStyle).toHaveBeenCalledTimes(2)
  expect(wrap).not.toHaveBeenCalled()
  expect(frame).not.toHaveBeenCalled()
})

test('logError - SDK error', () => {
  const error = new Error()
  error.message = JSON.stringify({
    message: 'Some error from the SDK',
    data: { foo: { bar: ['some', 'data'] } }
  })
  logError(error)
  expect(errorStyle).toHaveBeenCalledTimes(1)
  expect(wrap).toHaveBeenCalledTimes(1)
  expect(frame).toHaveBeenCalledTimes(1)
})

test('logError - non SDK error', () => {
  const error = new Error('Some non SDK error without stack')
  delete error.stack
  logError(error)
  expect(errorStyle).toHaveBeenCalledTimes(1)
  expect(wrap).toHaveBeenCalledTimes(1)
  expect(frame).not.toHaveBeenCalled()
})

test('logError - runtime error', () => {
  const error = new Error('Some runtime error')
  logError(error)
  expect(errorStyle).toHaveBeenCalledTimes(1)
  expect(wrap).toHaveBeenCalledTimes(1)
  expect(frame).toHaveBeenCalledTimes(1)
})

test('logError - precondition failed', () => {
  const error = new PreconditionFailedError('Some precondition error')
  logError(error)
  expect(errorStyle).toHaveBeenCalledTimes(1)
  expect(wrap).toHaveBeenCalledTimes(1)
  expect(frame).not.toHaveBeenCalled()
})
