import test from 'ava'

import { getPatchData } from '../../../../lib/core/diff/get-patch-data'

function removeFirstUpdateSecondAddThird () {
  const base = {
    displayField: 'DznyonGvWM9HHLy7',
    name: 'base',
    description: '',
    fields: [{
      id: 'DznyonGvWM9HHLy7',
      apiName: 'firstName',
      name: 'firstName',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'dfYqFqOw894YNNol',
      apiName: 'surname',
      name: 'lastName',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }
    ]
  }

  const target = {
    displayField: 'dfYqFqOw894YNNol',
    name: 'base',
    description: '',
    fields: [{
      id: 'dfYqFqOw894YNNol',
      apiName: 'lastName',
      name: 'lastName',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'cwcjodF6A233LW3L',
      apiName: 'age',
      name: 'age',
      type: 'Integer',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }
    ]
  }

  const patches = [{
    op: 'add',
    path: '/fields/-',
    value: {
      id: 'cwcjodF6A233LW3L',
      apiName: 'age',
      name: 'age',
      type: 'Integer',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }
  },
  {
    op: 'replace',
    path: '/fields/dfYqFqOw894YNNol/apiName',
    value: 'lastName'
  },
  {
    op: 'replace',
    path: '/displayField',
    value: 'dfYqFqOw894YNNol'
  },
  {
    op: 'replace',
    path: '/fields/DznyonGvWM9HHLy7/omitted',
    value: true
  },
  {
    op: 'add',
    path: '/fields/DznyonGvWM9HHLy7/deleted',
    value: true
  }]

  return { base, target, patches }
}

function removeAndAddFieldWithSameNameDifferentType () {
  const base = {
    displayField: 'dfYqFqOw894YNNol',
    name: 'base',
    description: '',
    fields: [{
      id: 'dfYqFqOw894YNNol',
      apiName: 'heading',
      name: 'heading',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'cwcjodF6A233LW3L',
      apiName: 'content',
      name: 'content',
      type: 'Text',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'elYqFqOw123YNNyp',
      apiName: 'author',
      name: 'author',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }]
  }

  const target = {
    displayField: 'dfYqFqOw894YNNol',
    name: 'base',
    description: '',
    fields: [{
      id: 'dfYqFqOw894YNNol',
      apiName: 'heading',
      name: 'heading',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'cwcjodF6A233LW3L',
      apiName: 'content',
      name: 'content',
      type: 'Text',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'LjRqFqOw123YmEpD',
      apiName: 'author',
      name: 'author',
      type: 'Symbol',
      items: {
        type: 'Link',
        linkType: 'Entry'
      },
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }]
  }

  const patches = [{
    op: 'add',
    path: '/fields/-',
    value: {
      id: 'LjRqFqOw123YmEpD',
      apiName: 'author',
      name: 'author',
      type: 'Symbol',
      items: {
        type: 'Link',
        linkType: 'Entry'
      },
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }
  },
  {
    op: 'replace',
    path: '/fields/elYqFqOw123YNNyp/omitted',
    value: true
  },
  {
    op: 'add',
    path: '/fields/elYqFqOw123YNNyp/deleted',
    value: true
  }]

  return { base, target, patches }
}

function addFieldBetweenTwoExistingFields () {
  const base = {
    displayField: 'dfYqFqOw894YNNol',
    name: 'base',
    description: '',
    fields: [{
      id: 'dfYqFqOw894YNNol',
      apiName: 'heading',
      name: 'heading',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'elYqFqOw123YNNyp',
      apiName: 'author',
      name: 'author',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }]
  }

  const target = {
    displayField: 'dfYqFqOw894YNNol',
    name: 'base',
    description: '',
    fields: [{
      id: 'dfYqFqOw894YNNol',
      apiName: 'heading',
      name: 'heading',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'cwcjodF6A233LW3L',
      apiName: 'content',
      name: 'content',
      type: 'Text',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    },
    {
      id: 'elYqFqOw123YNNyp',
      apiName: 'author',
      name: 'author',
      type: 'Symbol',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }]
  }

  const patches = [{
    op: 'add',
    path: '/fields/-',
    value: {
      id: 'cwcjodF6A233LW3L',
      apiName: 'content',
      name: 'content',
      type: 'Text',
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false
    }
  },
  {
    op: 'move',
    from: '/fields/2',
    path: '/fields/1'
  }]

  return { base, target, patches }
}

test('patch generation', (t) => {
  const mockFns = [
    removeFirstUpdateSecondAddThird,
    removeAndAddFieldWithSameNameDifferentType,
    addFieldBetweenTwoExistingFields
  ]

  t.plan(mockFns.length)

  mockFns.forEach((fn) => {
    const { base, target, patches } = fn()

    const generatedPatches = getPatchData(base, target)

    t.deepEqual(generatedPatches, patches, 'yields expected patch set')
  })
})
