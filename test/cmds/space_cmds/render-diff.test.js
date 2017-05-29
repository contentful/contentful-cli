import test from 'ava'
import chalk from 'chalk'
import { stub } from 'sinon'

import {
  resetDetectionOfFirstChunk,
  renderContentTypeDiff,
  formatDiff,
  renderModelDiff,
  __RewireAPI__ as rewireRenderDiff
} from '../../../lib/cmds/diff-patch/render-diff'

let getDiffBoundaries

test.beforeEach(() => {
  getDiffBoundaries = resetDetectionOfFirstChunk(2, '*')
})

test.afterEach.always(() => {
  rewireRenderDiff.__ResetDependency__('frame')
  rewireRenderDiff.__ResetDependency__('log')
  rewireRenderDiff.__ResetDependency__('renderContentTypeDiff')
})

test('diffBoundary finds boundaries', (t) => {
  const diff = [
    { value: 'Lorem ipsum dolor sit amet\n' },
    { value: 'consectetuer adipisci\n', added: true },
    { value: 'g elit. Aenean commodo \n' }
  ]

  let expected = {
    before: 'Lorem ipsum dolor sit amet\n',
    after: 'g elit. Aenean commodo \n'
  }

  let result = getDiffBoundaries(diff, 1)
  t.deepEqual(result, expected)
})

test('diffboundary boundaries only consist of whole lines', (t) => {
  const diff = [
    { value: 'lorem ipsum dolor sit amet\n' },
    { value: 'this should not be part of the diff\nthis is \nwhat should come before\n' },
    { value: 'consectetuer adipisci\n', added: true },
    { value: 'these lines\nshould come after\nbut not this anymore' },
    { value: 'g elit. aenean commodo \n' }
  ]

  let expected = {
    before: 'this is \nwhat should come before\n',
    after: 'these lines\nshould come after\n'
  }

  let result = getDiffBoundaries(diff, 2)
  t.deepEqual(result, expected)
})

test('diffBoundary only adds context around blocks of changes, not in between', (t) => {
  const diff = [
    { value: 'Lorem ipsum dolor sit amet\n' },
    { value: 'this was removed\n', removed: true },
    { value: 'this was added\n', added: true },
    { value: 'and this was also removed\n', removed: true },
    { value: 'g elit. Aenean commodo \n' }
  ]

  let expected = {
    before: 'Lorem ipsum dolor sit amet\n',
    after: null
  }

  let result = getDiffBoundaries(diff, 1)
  t.deepEqual(result, expected)
})

test('diffBoundary adds delimiter between change chunks', (t) => {
  const diff = [
    { value: 'Lorem ipsum dolor sit amet\n' },
    { value: 'this was removed\n', removed: true },
    { value: 'Lorem ipsum dolor sit amet, consectetuer adipisci\n' },
    { value: 'and this was also removed\n', removed: true },
    { value: 'g elit. Aenean commodo \n' }
  ]

  let expected = {
    before: '*' + 'Lorem ipsum dolor sit amet, consectetuer adipisci\n',
    after: 'g elit. Aenean commodo \n'
  }

  getDiffBoundaries(diff, 1)
  let result = getDiffBoundaries(diff, 3)
  t.deepEqual(result, expected)
})

test('formatDiff produces formatted diff', t => {
  const contentType = {
    name: 'foo',
    diff: [{
      added: true,
      value: 'bar'
    }, {
      value: 'baz'
    }]
  }
  const expected = ['foo\n\n', `${chalk.green('bar')}`, 'baz\n']
  const result = formatDiff(contentType)
  t.deepEqual(result, expected)
})

test('renderContentTypeDiff renders with changes', t => {
  rewireRenderDiff.__Rewire__('log', () => {})
  const contentType = {
    name: 'foo',
    diff: [{ value: 'bar', added: true }, { value: 'baz' }]
  }
  rewireRenderDiff.__Rewire__('frame', function () {
    t.pass()
  })
  renderContentTypeDiff(contentType)
})

test('renderContentTypeDiff does not render when no changes', t => {
  rewireRenderDiff.__Rewire__('log', () => {})
  const contentType = {
    name: 'foo',
    diff: [{ value: 'bar' }, { value: 'baz' }]
  }
  rewireRenderDiff.__Rewire__('frame', function () {
    t.fail()
  })
  renderContentTypeDiff(contentType)
  t.pass()
})

test('renderModelDiff renders CT diffs', t => {
  const model = [{
    name: 'foo',
    diff: [{
      added: true,
      value: 'bar'
    }, {
      value: 'baz'
    }]
  }, {
    name: 'bar',
    diff: [{ value: 'bar' }, { value: 'baz' }]
  }]
  const renderStub = stub()
  rewireRenderDiff.__Rewire__('renderContentTypeDiff', renderStub)
  renderModelDiff(model)
  t.is(renderStub.callCount, 2)
  t.true(renderStub.calledWith(model[0]))
  t.true(renderStub.calledWith(model[1]))
})
