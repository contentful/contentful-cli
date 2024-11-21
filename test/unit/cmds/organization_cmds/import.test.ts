import organizationImport from '../../../../lib/cmds/organization_cmds/import'
import { createPlainClient } from '../../../../lib/utils/contentful-clients'
import { readContentFile } from '../../../../lib/cmds/organization_cmds/utils/read-content-file'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/cmds/organization_cmds/utils/read-content-file')

const createTaxonomyConceptMock = (id: string, version?: number) => {
  const concept: any = {
    sys: {
      id,
      type: 'TaxonomyConcept',
      createdAt: '2021-01-01T00:00:00.000Z',
      createdBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: 'userId'
        }
      },
      updatedBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: 'userId'
        }
      },
      updatedAt: '2021-01-01T00:00:00.000Z'
    },
    prefLabel: {
      en: 'prefLabel'
    },
    altLabels: {
      en: ['altLabel']
    },
    definition: {
      en: 'definition'
    },
    note: {
      en: 'notes'
    },
    scopeNote: {
      en: 'scopeNote'
    },
    editorialNote: {
      en: 'editorialNote'
    },
    historyNote: {
      en: 'historyNote'
    },
    hiddenLabels: {
      en: ['hiddenLabel']
    },
    uri: 'uri' + id,
    broader: [
      { sys: { id: 'broaderId', type: 'Link', linkType: 'TaxonomyConcept' } }
    ],
    related: [
      { sys: { id: 'relatedId', type: 'Link', linkType: 'TaxonomyConcept' } }
    ],
    example: {
      en: 'example'
    },
    notations: ['notation']
  }
  if (version) {
    concept.sys.version = version
  }
  return concept
}

const createTaxonomyConceptSchemeMock = (
  id: string,
  conceptIds: string[],
  version?: number
) => {
  const scheme: any = {
    concepts: conceptIds.map(conceptId => ({
      sys: {
        id: conceptId,
        type: 'Link',
        linkType: 'TaxonomyConcept'
      }
    })),
    sys: {
      id,
      type: 'TaxonomyConceptScheme',
      createdAt: '2021-01-01T00:00:00.000Z',
      createdBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: 'userId'
        }
      },
      updatedBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: 'userId'
        }
      },
      updatedAt: '2021-01-01T00:00:00.000Z'
    },
    prefLabel: {
      en: 'prefLabel'
    },
    definition: {
      en: 'definition'
    },
    topConcepts: conceptIds.map(conceptId => ({
      sys: {
        id: conceptId,
        type: 'Link',
        linkType: 'TaxonomyConcept'
      }
    })),
    totalConcepts: conceptIds.length,
    uri: 'uri' + id
  }
  if (version) {
    scheme.sys.version = version
  }
  return scheme
}

const fakeClient = {
  concept: {
    createWithId: jest.fn(),
    updatePut: jest.fn(),
    patch: jest.fn()
  },
  conceptScheme: {
    createWithId: jest.fn(),
    updatePut: jest.fn()
  }
}

const mockCreatePlainClient = (
  createPlainClient as unknown as jest.Mock
).mockResolvedValue(fakeClient)

const mockReadContentFile = readContentFile as unknown as jest.Mock

afterEach(() => {
  jest.clearAllMocks()
})

test('initializes client w/ taxonomy data - createWithId', async () => {
  mockReadContentFile.mockResolvedValue({
    taxonomy: {
      concepts: [
        createTaxonomyConceptMock('1'),
        createTaxonomyConceptMock('2')
      ],
      conceptSchemes: [createTaxonomyConceptSchemeMock('3', ['1', '2'])]
    }
  })
  await organizationImport({
    organizationId: 'orgId',
    contentFile: 'path/to/file',
    context: {
      managementToken: 'managementToken'
    }
  })

  expect(mockCreatePlainClient).toHaveBeenCalledTimes(1)
  expect(mockReadContentFile).toHaveBeenCalledTimes(1)
  expect(fakeClient.concept.createWithId).toHaveBeenCalledTimes(2)
  expect(fakeClient.concept.updatePut).toHaveBeenCalledTimes(0)
  expect(fakeClient.concept.patch).toHaveBeenCalledTimes(2)
  expect(fakeClient.conceptScheme.createWithId).toHaveBeenCalledTimes(1)
  expect(fakeClient.conceptScheme.updatePut).toHaveBeenCalledTimes(0)
})

test('initializes client w/ taxonomy data - updatePut', async () => {
  mockReadContentFile.mockResolvedValue({
    taxonomy: {
      concepts: [
        createTaxonomyConceptMock('1', 1),
        createTaxonomyConceptMock('2', 1)
      ],
      conceptSchemes: [createTaxonomyConceptSchemeMock('3', ['1', '2'], 1)]
    }
  })
  await organizationImport({
    organizationId: 'orgId',
    contentFile: 'path/to/file',
    context: {
      managementToken: 'managementToken'
    }
  })

  expect(mockCreatePlainClient).toHaveBeenCalledTimes(1)
  expect(mockReadContentFile).toHaveBeenCalledTimes(1)
  expect(fakeClient.concept.createWithId).toHaveBeenCalledTimes(0)
  expect(fakeClient.concept.updatePut).toHaveBeenCalledTimes(2)
  expect(fakeClient.concept.patch).toHaveBeenCalledTimes(2)
  expect(fakeClient.conceptScheme.createWithId).toHaveBeenCalledTimes(0)
  expect(fakeClient.conceptScheme.updatePut).toHaveBeenCalledTimes(1)
})

test('initializes client without taxonomy data', async () => {
  mockReadContentFile.mockResolvedValue({})
  await organizationImport({
    organizationId: 'orgId',
    contentFile: 'path/to/file',
    context: {
      managementToken: 'managementToken'
    }
  })

  expect(mockCreatePlainClient).toHaveBeenCalledTimes(1)
  expect(mockReadContentFile).toHaveBeenCalledTimes(1)
  expect(fakeClient.concept.createWithId).toHaveBeenCalledTimes(0)
  expect(fakeClient.concept.updatePut).toHaveBeenCalledTimes(0)
  expect(fakeClient.concept.patch).toHaveBeenCalledTimes(0)
  expect(fakeClient.conceptScheme.createWithId).toHaveBeenCalledTimes(0)
  expect(fakeClient.conceptScheme.updatePut).toHaveBeenCalledTimes(0)
})
