const {
  buildTree
} = require('../../../lib/cmds/organization_cmds/taxonomy/buildTree')
const {
  findAllHierarchyAndMaxDepth
} = require('../../../lib/cmds/organization_cmds/taxonomy-export')

// concept:1 -> concept:2 -> concept:4
//           -> concept:3

const sampleConcepts = [
  {
    uri: 'concept:1',
    prefLabel: {
      'en-US': 'concept1'
    },
    sys: {
      id: 'concept1'
    },
    broader: []
  },
  {
    uri: 'concept:2',
    prefLabel: {
      'en-US': 'concept2'
    },
    sys: {
      id: 'concept2'
    },
    broader: [
      {
        sys: { id: 'concept1' }
      }
    ]
  },
  {
    uri: 'concept:4',
    prefLabel: {
      'en-US': 'concept4'
    },
    sys: {
      id: 'concept4'
    },
    broader: [
      {
        sys: { id: 'concept2' }
      }
    ]
  },
  {
    uri: 'concept:3',
    prefLabel: {
      'en-US': 'concept3'
    },
    sys: {
      id: 'concept3'
    },
    broader: [
      {
        sys: { id: 'concept1' }
      }
    ]
  }
]

const sampleConceptSchemes = {
  uri: 'conceptScheme:1',
  prefLabel: {
    'en-US': 'conceptScheme:1'
  },
  sys: {
    id: 'conceptScheme1'
  },
  concepts: [{ sys: { id: 'concept1' } }, { sys: { id: 'concept2' } }]
}

const conceptInSchemeIds = sampleConceptSchemes.concepts.map(c => c.sys.id)
const tree = buildTree(sampleConcepts, {
  getItemId: c => c.sys.id,
  getParentIds: c => {
    const parentIds = []
    for (const b of c.broader) {
      if (conceptInSchemeIds.includes(b.sys.id)) {
        parentIds.push(b.sys.id)
      }
    }
    return parentIds.length ? parentIds : [null]
  }
})

test('buildTree results', async () => {
  expect(tree[0].children.length).toBe(2)
  expect(tree[0].children[0].sys.id).toBe('concept2')
  expect(tree[0].children[1].sys.id).toBe('concept3')
  expect(tree[0].sys.id).toBe('concept1')
  expect(tree[0].children[0].children.length).toBe(1)
  expect(tree[0].children[1].children.length).toBe(0)
  expect(tree[0].children[0].children[0].sys.id).toBe('concept4')
})

test('findAllHierarchyAndMaxDepth results', async () => {
  const exportsCsv = []

  const maxDepth = findAllHierarchyAndMaxDepth(tree, 0, exportsCsv)
  expect(maxDepth).toBe(2)
  expect(exportsCsv[0]).toBe(',,concept1,concept1')
  expect(exportsCsv[1]).toBe(',,,,concept2,concept2')
  expect(exportsCsv[3]).toBe(',,,,concept3,concept3')
})
