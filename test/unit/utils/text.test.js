import wrapAnsi from 'wrap-ansi'
import { textSync } from 'figlet'
import stripAnsi from 'strip-ansi'

import {
  wrap,
  frame,
  asciiText,
  separator,
  DEFAULT_COLUMNS
} from '../../../lib/utils/text'

jest.mock('figlet')
jest.mock('wrap-ansi', () => jest.fn().mockImplementation((...args) => {
  const wrapAnsi = require.requireActual('wrap-ansi')
  return wrapAnsi(...args)
}))

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
  asciiText('some text')
  expect(textSync).toHaveBeenCalledTimes(1)
  expect(textSync.mock.calls[0][0]).toBe('some text')
})

test('separator', () => {
  const sep = stripAnsi(separator())
  expect(sep.length).toBe(DEFAULT_COLUMNS)
})
