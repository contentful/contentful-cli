import test from 'ava'
import chalk from 'chalk'
import {
  getPatchesAndDiff,
  renderDiff,
  __RewireAPI__ as rewire
} from '../../../lib/cmds/space_cmds/diff/index'

test.afterEach.always(() => {
  rewire.__ResetDependency__('diffJson')
  rewire.__ResetDependency__('getDiffOrPatchData')
  rewire.__ResetDependency__('getDiffData')
  rewire.__ResetDependency__('getPatchData')
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

  rewire.__Rewire__('diffJson', fakeCompare)
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

  rewire.__Rewire__('getPatchData', function () { return null })
  rewire.__Rewire__('getDiffData', function () { return null })

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
  console.log(result)
  t.deepEqual(result.diff, expected.diff)
  t.deepEqual(result.patches, expected.patches)
})

test('renderDiff renders changes including context', (t) => {
  const diffData = [
    {
      name: 'a content type where nothing changed',
      diff: [{ value: 'nulla ut metus varius laor\n' }]
    },
    {
      name: 'another content type',
      diff: [
        { value: 'Lorem ipsum dolor sit amet\n' },
        { value: 'consectetuer adipisci\n', added: true },
        { value: 'g elit. Aenean commodo \n' }
      ]
    }
  ]

  rewire.__Rewire__('frame', function (str) {
    let expected =
      'another content type\n\n' +
      'Lorem ipsum dolor sit amet\n' +
      chalk.green('consectetuer adipisci\n') +
      'g elit. Aenean commodo \n'

    t.is(str, expected)
  })

  renderDiff(diffData)
})

test('renderDiff only adds context around blocks of changes, not in between', (t) => {
  const diffData = [
    {
      name: 'a content type where nothing changed',
      diff: [{ value: 'nulla ut metus varius laor' }]
    },
    {
      name: 'another content type',
      diff: [
        { value: 'Lorem ipsum dolor sit amet\n' },
        { value: 'this was removed\n', removed: true },
        { value: 'this was added\n', added: true },
        { value: 'and this was also removed\n', removed: true },
        { value: 'g elit. Aenean commodo \n' }
      ]
    }
  ]

  rewire.__Rewire__('frame', function (str) {
    let expected =
      'another content type\n\n' +
      'Lorem ipsum dolor sit amet\n' +
      chalk.red('this was removed\n') +
      chalk.green('this was added\n') +
      chalk.red('and this was also removed\n') +
      'g elit. Aenean commodo \n'

    t.is(str, expected)
  })

  renderDiff(diffData)
})

test('renderDiff does not repeat context chunks', (t) => {
  const diffData = [
    {
      name: 'a content type where nothing changed',
      diff: [{ value: 'nulla ut metus varius laor' }]
    },
    {
      name: 'another content type',
      diff: [
        { value: 'Lorem ipsum dolor sit amet\n' },
        { value: 'this was removed\n', removed: true },
        { value: 'Lorem ipsum dolor sit amet, consectetuer adipisci\n' },
        { value: 'and this was also removed\n', removed: true },
        { value: 'g elit. Aenean commodo \n' }
      ]
    }
  ]

  rewire.__Rewire__('frame', function (str) {
    let expected =
      'another content type\n\n' +
      'Lorem ipsum dolor sit amet\n' +
      chalk.red('this was removed\n') +
      'Lorem ipsum dolor sit amet, consectetuer adipisci\n' +
      '\n' + '-'.repeat(30) + '\n\n' +
      'Lorem ipsum dolor sit amet, consectetuer adipisci\n' +
      chalk.red('and this was also removed\n') +
      'g elit. Aenean commodo \n'

    t.is(str, expected)
  })

  renderDiff(diffData)
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
  t.is(ctPatch.patches[0].path, '/fields/1/omitted', 'It should point to omitted property')
  t.is(ctPatch.patches[0].value, true, 'It should set omitted to true')

  t.is(ctPatch.patches[1].op, 'add', 'it should be a `add` `op` for deleted property')
  t.is(ctPatch.patches[1].path, '/fields/1/deleted', 'It should point to the deleted property')
  t.is(ctPatch.patches[1].value, true, 'it should set deleted property to true')
})

test('uh oh this is not right', (t) => {
  const sourceCT = {
    sys: {
      id: 'ctid'
    },
    name: 'CT',
    fields: [
      {
        'id': 'companydescription',
        'immutableId': 'immutable-1',
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
        'immutableId': 'immutable-1',
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
        'immutableId': 'immutable-2',
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
  console.log(ctPatch)
  t.pass()
})
