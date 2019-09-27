const wrapAnsi = require('wrap-ansi')
const { textSync } = require('figlet')
const stripAnsi = require('strip-ansi')
const chalk = require('chalk')

const {
  wrap,
  frame,
  asciiText,
  separator,
  DEFAULT_COLUMNS
} = require('../../../lib/utils/text')

jest.mock('figlet')
jest.mock('chalk', () => ({
  dim: jest.fn(val => val),
  bold: jest.fn(val => val)
}))
jest.mock('wrap-ansi', () =>
  jest.fn().mockImplementation((...args) => {
    const wrapAnsi = require.requireActual('wrap-ansi')
    return wrapAnsi(...args)
  })
)

afterEach(() => {
  wrapAnsi.mockClear()
  textSync.mockClear()
})

test('wrap', () => {
  const charactersForTwoLines = (DEFAULT_COLUMNS + 1) * 2
  const longSingleWord = Array(charactersForTwoLines).join('x')
  const resultSingleWord = wrap(longSingleWord)
  expect(resultSingleWord.length).toBe(longSingleWord.length)
  expect(wrapAnsi).toHaveBeenCalledTimes(1)
  wrapAnsi.mockClear()

  const longWords = Array(20).join('x ')
  const longWordsResult = wrap(longWords, 20)
  expect(longWordsResult).toBe('x x x x x x x x x x \nx x x x x x x x x ')
  expect(wrapAnsi).toHaveBeenCalledTimes(1)
})

test('frame - full width', () => {
  const fullFrame = stripAnsi(frame('Foo'))
  const lines = fullFrame.split('\n')
  expect(lines[0].charAt(0)).toBe('┌')
  expect(lines[0].charAt(lines[0].length - 1)).toBe('┐')
  expect(lines[0].length).toBe(DEFAULT_COLUMNS)
})

test('frame - inline', () => {
  const fullFrame = stripAnsi(frame('Foo', true))
  const lines = fullFrame.split('\n')
  expect(lines[0].charAt(0)).toBe('┌')
  expect(lines[0].charAt(lines[0].length - 1)).toBe('┐')
  expect(lines[0].length).toBe(7)
})

test('asciiText', () => {
  process.stdout.columns = 80
  asciiText('some text')
  expect(textSync).toHaveBeenCalledTimes(1)
  expect(textSync.mock.calls[0][0]).toBe('some text')
  expect(chalk.bold).not.toHaveBeenCalled()
})

test('asciiText fallback', () => {
  process.stdout.columns = 70
  asciiText('some fallback text')
  expect(chalk.bold).toHaveBeenCalledTimes(1)
  expect(chalk.bold.mock.calls[0][0]).toBe('some fallback text')
  expect(textSync).not.toHaveBeenCalled()
})

test('separator', () => {
  const sep = stripAnsi(separator())
  expect(sep.length).toBe(DEFAULT_COLUMNS)
})
