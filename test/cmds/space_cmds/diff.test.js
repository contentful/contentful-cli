import test from 'ava'
import chalk from 'chalk'
import { stub } from 'sinon'
import {
  getPatchesAndDiff,
  __RewireAPI__ as rewirePatchDiff
} from '../../../lib/cmds/diff-patch/diff-patch-data'

import {
  resetDetectionOfFirstChunk,
  renderContentTypeDiff,
  renderModelDiff,
  __RewireAPI__ as rewireRenderDiff
} from '../../../lib/cmds/diff-patch/render-diff'

let getDiffBoundaries

test.afterEach.always(() => {
  rewirePatchDiff.__ResetDependency__('diffJson')
  rewirePatchDiff.__ResetDependency__('getDiffOrPatchData')
  rewirePatchDiff.__ResetDependency__('getDiffData')
  rewirePatchDiff.__ResetDependency__('getPatchData')
  rewireRenderDiff.__ResetDependency__('frame')
  getDiffBoundaries = resetDetectionOfFirstChunk(2, '*')
})

test('diff and patches remove unneeded props from content types', t => {
  const currentModel = [{
    sys: {
      id: 1,
      publishedAt: null,
      publishedBy: null,
      version: null,
      firstPublishedAt: null
    },
    name: 'foo'
  }]
  const targetModel = [{
    displayName: 'bar',
    sys: {
      id: 1,
      publishedCounter: null,
      publishedVersion: null,
      updatedAt: null,
      updatedBy: null
    }
  }]

  rewirePatchDiff.__Rewire__('diffJson', fakeCompare)
  function fakeCompare (y, x) {
    const cleanedX = {
      name: 'foo'
    }
    const cleanedY = {
      displayName: 'bar'
    }
    t.deepEqual(x, cleanedX)
    t.deepEqual(y, cleanedY)
    return []
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

  rewirePatchDiff.__Rewire__('diffJson', fakeCompare)
  function fakeCompare (y, x) {
    t.deepEqual(x, { name: 'foo', somethingElse: 'bar' })
    t.deepEqual(y, {})
    return []
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

  rewirePatchDiff.__Rewire__('getPatchData', function () { return null })
  rewirePatchDiff.__Rewire__('getDiffData', function () { return null })

  const expected = {
    diff: [
      { name: 'content type A', diff: null },
      { name: 'content type B', diff: null },
      { name: 'content type C', diff: null }
    ],
    patches: [
      { name: 'content type A', id: 1, action: 'patch', patches: null },
      {
        name: 'content type B',
        id: 2,
        action: 'create',
        patches: [ { op: 'add', path: '', value: { name: 'content type B' } } ]
      },
      { name: 'content type C', id: 3, action: 'delete', patches: [] }
    ]
  }

  const result = getPatchesAndDiff(currentModel, targetModel)
  t.deepEqual(result.diff, expected.diff)
  t.deepEqual(result.patches, expected.patches)
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

test('renderContentTypeDiff renders', t => {
  rewireRenderDiff.__Rewire__('log', () => {})
  const contentType = {
    name: 'foo',
    diff: [{
      added: true,
      value: 'bar'
    }, {
      value: 'baz'
    }]
  }
  const expected = `foo\n\n${chalk.green('bar')}baz\n`
  rewireRenderDiff.__Rewire__('frame', function (result) {
    t.is(result, expected)
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

  t.is(ctPatch.patches[0].op, 'replace', 'It should be a `replace` `op` for omitted property')
  t.is(ctPatch.patches[0].path, '/fields/companydescription/omitted', 'It should point to omitted property')
  t.is(ctPatch.patches[0].value, true, 'It should set omitted to true')

  t.is(ctPatch.patches[1].op, 'add', 'it should be a `add` `op` for deleted property')
  t.is(ctPatch.patches[1].path, '/fields/companydescription/deleted', 'It should point to the deleted property')
  t.is(ctPatch.patches[1].value, true, 'it should set deleted property to true')
})

test('detect field renaming', (t) => {
  const sourceCT = {
    sys: {
      id: 'ctid'
    },
    name: 'CT',
    fields: [
      {
        'apiName': 'companydescription',
        'id': 'immutable-1',
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
        'apiName': 'companyName',
        'id': 'immutable-1',
        'name': 'Company name',
        'type': 'Text',
        'localized': false,
        'required': true,
        'validations': [],
        'disabled': false,
        'omitted': false
      },
      {
        'apiName': 'companydescription',
        'id': 'immutable-2',
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
  const result = getPatchesAndDiff([destinationCT], [sourceCT])
  const ctPatch = result.patches[0]

  t.is(ctPatch.patches.length, 3)

  t.is(ctPatch.patches[0].op, 'replace')
  t.is(ctPatch.patches[0].path, '/fields/immutable-1/name')

  t.is(ctPatch.patches[1].op, 'replace')
  t.is(ctPatch.patches[1].path, '/fields/immutable-1/apiName')

  t.is(ctPatch.patches[2].op, 'add')
  t.is(ctPatch.patches[2].path, '/fields/-')
})

test('"patch" action', (t) => {
  const sourceCT = {
    sys: { id: 'ctid' },
    name: 'CT',
    fields: [{ 'id': 'myfield', 'type': 'Text' }]
  }
  const destinationCT = {
    sys: { id: 'ctid' },
    name: 'CT',
    fields: [{ 'id': 'myfield', 'type': 'Text', 'omitted': true }]
  }
  const result = getPatchesAndDiff([destinationCT], [sourceCT])
  const patches = result.patches

  t.is(patches[0].action, 'patch')
})

test('"delete" action', (t) => {
  const sourceCT = {
    sys: { id: 'ctid' },
    name: 'CT',
    fields: [{ 'id': 'myfield', 'type': 'Text' }]
  }
  const result = getPatchesAndDiff([], [sourceCT])
  const patches = result.patches

  t.is(patches[0].id, 'ctid')
  t.is(patches[0].action, 'delete')
})

test('"create" action', (t) => {
  const sourceCT = {
    sys: { id: 'ctid' },
    name: 'CT',
    fields: [{ 'id': 'myfield', 'type': 'Text' }]
  }
  const result = getPatchesAndDiff([sourceCT], [])
  const patches = result.patches

  t.is(patches[0].id, 'ctid')
  t.is(patches[0].action, 'create')
  t.is(patches[0].patches[{ op: 'add', path: '', value: sourceCT }])
})
