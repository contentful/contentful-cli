import { CollectionProp, ConceptProps } from 'contentful-management'
import organizationExport from '../../../../lib/cmds/organization_cmds/export'
import { createPlainClient } from '../../../../lib/utils/contentful-clients'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/contentful-clients')
jest.mock('../../../../lib/utils/log')

const createTaxonomyConceptMock = (id: string): ConceptProps => ({
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
    updatedAt: '2021-01-01T00:00:00.000Z',
    version: 1
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
  broader: [],
  related: [],
  example: {
    en: 'example'
  },
  notations: ['notation']
})

const conceptsData = {
  sys: {
    type: 'Array'
  },
  items: [createTaxonomyConceptMock('1'), createTaxonomyConceptMock('2')]
}

const fakeClient = {
  concept: {
    getMany: jest.fn().mockResolvedValue(conceptsData)
  },
  conceptScheme: {
    getMany: jest.fn().mockResolvedValue({ items: [] })
  }
}

const mockCreatePlainClient = (
  createPlainClient as unknown as jest.Mock
).mockResolvedValue(fakeClient)

afterEach(() => {
  mockCreatePlainClient.mockClear()
})

test.only('initializes client', async () => {
  await organizationExport({
    context: {
      managementToken: 'managementToken'
    },
    organizationId: 'mockedOrganizationId'
  })

  expect(mockCreatePlainClient).toHaveBeenCalledTimes(1)
  expect(fakeClient.concept.getMany).toHaveBeenCalledTimes(1)
  expect(fakeClient.conceptScheme.getMany).toHaveBeenCalledTimes(1)
})
