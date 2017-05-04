import test from 'ava'
import {
  getPatchesAndDiff,
  __RewireAPI__ as rewire
} from '../../../lib/cmds/space_cmds/diff/index'

test.afterEach.always(() => {
  rewire.__ResetDependency__('diffJson')
  rewire.__ResetDependency__('getDiffOrPatchData')
})

test('diff and patches remove unneeded props from content types', t => {
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

test('diff and patches leave other values alone', t => {
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

test('diff and patches consider content types from both current and target model', t => {
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

test('It should add an extra operation when a field is deleted', (t) => {
  const sourceCT = {
    sys: {
      id: 'ctid'
    },
    name: 'CT',
    fields: [
      {
        'id': 'companyName',
        'name': 'Company name',
        'type': 'Text',
        'localized': false,
        'required': true,
        'validations': [],
        'disabled': false,
        'omitted': false
      },
      {
        'id': 'companydescription',
        'name': 'Company Description',
        'type': 'Text',
        'localized': false,
        'required': true,
        'validations': [],
        'disabled': false,
        'omitted': false
      }
    ]
  }
  const destinationCT = {
    sys: {
      id: 'ctid'
    },
    name: 'CT',
    fields: [
      {
        'id': 'companyName',
        'name': 'Company name',
        'type': 'Text',
        'localized': false,
        'required': true,
        'validations': [],
        'disabled': false,
        'omitted': false
      }
    ]
  }
  const result = getPatchesAndDiff([destinationCT], [sourceCT])
  const ctPatch = result.patches[0]
  t.is(ctPatch.patches[0].op, 'replace')
  t.is(ctPatch.patches[0].path, '/fields/1/omitted')
  t.is(ctPatch.patches[0].value, true)

  t.is(ctPatch.patches[1].op, 'replace')
  t.is(ctPatch.patches[1].path, '/fields/1/deleted')
  t.is(ctPatch.patches[1].value, true)
})
