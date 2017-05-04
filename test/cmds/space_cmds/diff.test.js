import test from 'ava'
import {
  getPatchesAndDiff,
  __RewireAPI__ as rewire
} from '../../../lib/cmds/space_cmds/diff/index'

test.afterEach.always(() => {
  rewire.__ResetDependency__('diffJson')
  rewire.__ResetDependency__('getDiffOrPatchData')
})

test('getDiffOrPatchData removes unneeded props from content types', t => {
  const currentModel = [{
    sys: { id: 1 },
    version: null,
    firstPublishedAt: null,
    name: 'foo',
    publishedAt: null,
    publishedBy: null
  }]
  const targetModel = [{
    sys: { id: 1 },
    publishedCounter: null,
    publishedVersion: null,
    updatedAt: null,
    displayName: 'bar',
    updatedBy: null
  }]

  rewire.__Rewire__('diffJson', fakeCompare)
  function fakeCompare (y, x) {
    const cleanedX = {
      name: 'foo'
    }
    const cleanedY = {
      displayName: 'bar'
    }
    t.deepEqual(x, cleanedX)
    t.deepEqual(y, cleanedY)
  }

  getPatchesAndDiff(currentModel, targetModel)
})

test('getDiffOrPatchData leaves other values alone', t => {
  const currentModel = [{
    sys: { id: 1 },
    name: 'foo',
    somethingElse: 'bar'
  }]
  const targetModel = []

  rewire.__Rewire__('diffJson', fakeCompare)
  function fakeCompare (y, x) {
    t.deepEqual(x, { name: 'foo', somethingElse: 'bar' })
    t.deepEqual(y, '')
  }

  getPatchesAndDiff(currentModel, targetModel)
})

test('getPatchesAndDiff considers content types from both current and target model', t => {
  const currentModel = [
    {
      sys: { id: 1 },
      name: 'content type A'
    },
    {
      sys: { id: 2 },
      name: 'content type B'
    }
  ]
  const targetModel = [
    {
      sys: { id: 1 },
      name: 'this used to have a different name'
    },
    {
      sys: { id: 3 },
      name: 'content type C'
    }
  ]

  rewire.__Rewire__('getDiffOrPatchData', function () { return null })

  const expected = {
    diff: [
      { name: 'content type A', diff: null },
      { name: 'content type B', diff: null },
      { name: 'content type C', diff: null }
    ],
    patches: [
      { name: 'content type A', patches: null },
      { name: 'content type B', patches: null },
      { name: 'content type C', patches: null }
    ]
  }

  const result = getPatchesAndDiff(currentModel, targetModel)

  t.deepEqual(result.diff, expected.diff)
  t.deepEqual(result.patches, expected.patches)
})
