import { spy } from 'sinon'
import wrapAnsi from 'wrap-ansi'
import figlet from 'figlet'
import stripAnsi from 'strip-ansi'

import {
  wrap,
  frame,
  asciiText,
  separator,
  DEFAULT_COLUMNS,
  __RewireAPI__ as textRewireAPI
} from '../../../lib/utils/text'

const wrapAnsiSpy = spy(wrapAnsi)
const textSyncSpy = spy(figlet, 'textSync')

beforeAll(() => {
  textRewireAPI.__Rewire__('wrapAnsi', wrapAnsiSpy)
  textRewireAPI.__Rewire__('figlet', figlet)
})

afterAll(() => {
  textRewireAPI.__ResetDependency__('wrapAnsi')
  textRewireAPI.__ResetDependency__('figlet')
})

afterEach(() => {
  wrapAnsiSpy.resetHistory()
  textSyncSpy.resetHistory()
})

test('wrap', () => {
  const charactersForTwoLines = (DEFAULT_COLUMNS + 1) * 2
  const longSingleWord = Array(charactersForTwoLines).join('x')
  const resultSingleWord = wrap(longSingleWord)
  expect(resultSingleWord.length).toBe(longSingleWord.length)
  expect(wrapAnsiSpy.callCount).toBe(1)
  wrapAnsiSpy.resetHistory()

  const longWords = Array(20).join('x ')
  const longWordsResult = wrap(longWords, 20)
  expect(longWordsResult).toBe('x x x x x x x x x x \nx x x x x x x x x ')
  expect(wrapAnsiSpy.callCount).toBe(1)
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
  expect(textSyncSpy.callCount).toBe(1)
  expect(textSyncSpy.args[0][0]).toBe('some text')
})

test('separator', () => {
  const sep = stripAnsi(separator())
  expect(sep.length).toBe(DEFAULT_COLUMNS)
})
