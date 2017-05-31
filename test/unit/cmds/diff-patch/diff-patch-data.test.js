import test from 'ava'
import {
  getPatchesAndDiff,
  __RewireAPI__ as rewirePatchDiff
} from '../../../../lib/cmds/diff-patch/diff-patch-data'

test.afterEach.always(() => {
  rewirePatchDiff.__ResetDependency__('diffJson')
  rewirePatchDiff.__ResetDependency__('getDiffOrPatchData')
  rewirePatchDiff.__ResetDependency__('getDiffData')
  rewirePatchDiff.__ResetDependency__('getPatchData')
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

  t.is(ctPatch.patches[0].op, 'add')
  t.is(ctPatch.patches[0].path, '/fields/-')

  t.is(ctPatch.patches[1].op, 'replace')
  t.is(ctPatch.patches[1].path, '/fields/immutable-1/name')

  t.is(ctPatch.patches[2].op, 'replace')
  t.is(ctPatch.patches[2].path, '/fields/immutable-1/apiName')
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
