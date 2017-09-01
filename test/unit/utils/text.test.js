import test from 'ava'
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

test.before(() => {
  textRewireAPI.__Rewire__('wrapAnsi', wrapAnsiSpy)
  textRewireAPI.__Rewire__('figlet', figlet)
})

test.after.always(() => {
  textRewireAPI.__ResetDependency__('wrapAnsi')
  textRewireAPI.__ResetDependency__('figlet')
})

test.afterEach((t) => {
  wrapAnsiSpy.reset()
  textSyncSpy.reset()
})

test('wrap', (t) => {
  const charactersForTwoLines = (DEFAULT_COLUMNS + 1) * 2
  const longSingleWord = Array(charactersForTwoLines).join('x')
  const resultSingleWord = wrap(longSingleWord)
  t.is(resultSingleWord.length, longSingleWord.length, 'does not wrap words')
  t.is(wrapAnsiSpy.callCount, 1, 'wrap was called once')
  wrapAnsiSpy.reset()

  const longWords = Array(20).join('x ')
  const longWordsResult = wrap(longWords, 20)
  t.is(longWordsResult, 'x x x x x x x x x x \nx x x x x x x x x ', 'does wrap words, do not trim but adds linebreaks')
  t.is(wrapAnsiSpy.callCount, 1, 'wrap was called once')
})

test('frame - full width', (t) => {
  const fullFrame = stripAnsi(frame('Foo'))
  const lines = fullFrame.split('\n')
  t.is(lines[0].charAt(0), '┌', 'correct corner at the beginning')
  t.is(lines[0].charAt(lines[0].length - 1), '┐', 'correct corner at the end')
  t.is(lines[0].length, DEFAULT_COLUMNS, 'frame fills the whole line')
})

test('frame - inline', (t) => {
  const fullFrame = stripAnsi(frame('Foo', true))
  const lines = fullFrame.split('\n')
  t.is(lines[0].charAt(0), '┌', 'correct corner at the beginning')
  t.is(lines[0].charAt(lines[0].length - 1), '┐', 'correct corner at the end')
  t.is(lines[0].length, 7, 'frame is not longer')
})

test('asciiText', (t) => {
  asciiText('some text')
  t.is(textSyncSpy.callCount, 1, 'text transform function was called')
  t.is(textSyncSpy.args[0][0], 'some text', 'passed the text further to text transform function')
})

test('separator', (t) => {
  const sep = stripAnsi(separator())
  t.is(sep.length, DEFAULT_COLUMNS, 'separator covers whole CLI width')
})
