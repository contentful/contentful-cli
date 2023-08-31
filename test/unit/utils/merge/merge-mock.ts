import { ChangesetItem } from '../../../../lib/utils/merge/types'

export const ContentModel = [
  {
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'nw11huk0weng'
        }
      },
      id: 'secondContentType',
      type: 'ContentType',
      createdAt: '2022-04-21T06:02:38.871Z',
      updatedAt: '2023-01-04T13:21:11.635Z',
      environment: {
        sys: {
          id: 'copy-of-master',
          type: 'Link',
          linkType: 'Environment'
        }
      },
      publishedVersion: 11,
      publishedAt: '2023-01-04T13:21:11.635Z',
      firstPublishedAt: '2022-04-21T06:02:39.393Z',
      createdBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      },
      updatedBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      },
      publishedCounter: 6,
      version: 12,
      publishedBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      }
    },
    displayField: 'name',
    name: 'Second Content type',
    description: '',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: 'Symbol',
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: 'firstContentType',
        name: 'first content type',
        type: 'Link',
        localized: false,
        required: false,
        validations: [
          {
            linkContentType: ['firstContentType'],
            message: '"first content type" has to exist if it is reference'
          }
        ],
        disabled: false,
        omitted: false,
        linkType: 'Entry'
      },
      {
        id: 'specialDiscount',
        name: 'specialDiscount',
        type: 'Boolean',
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: 'salePrice',
        name: 'SalePrice',
        type: 'Integer',
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      }
    ]
  },
  {
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'nw11huk0weng'
        }
      },
      id: 'firstContentType',
      type: 'ContentType',
      createdAt: '2023-01-04T13:21:10.215Z',
      updatedAt: '2023-01-04T13:21:10.589Z',
      environment: {
        sys: {
          id: 'copy-of-master',
          type: 'Link',
          linkType: 'Environment'
        }
      },
      publishedVersion: 1,
      publishedAt: '2023-01-04T13:21:10.589Z',
      firstPublishedAt: '2023-01-04T13:21:10.589Z',
      createdBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      },
      updatedBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      },
      publishedCounter: 1,
      version: 2,
      publishedBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      }
    },
    displayField: 'aSimpleTextField',
    name: 'First Content Type 1',
    description: 'Here goes aa fancy description, changed',
    fields: [
      {
        id: 'aSimpleTextField',
        name: 'A Simple Text field - with a new name',
        type: 'Symbol',
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: 'newlyAddedField',
        name: 'Newly added Field',
        type: 'Integer',
        localized: false,
        required: false,
        validations: [
          {
            unique: true
          }
        ],
        disabled: false,
        omitted: false
      }
    ]
  },
  {
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'nw11huk0weng'
        }
      },
      id: 'blurhashImage',
      type: 'ContentType',
      createdAt: '2023-01-04T13:21:08.755Z',
      updatedAt: '2023-01-04T13:21:09.342Z',
      environment: {
        sys: {
          id: 'copy-of-master',
          type: 'Link',
          linkType: 'Environment'
        }
      },
      publishedVersion: 1,
      publishedAt: '2023-01-04T13:21:09.342Z',
      firstPublishedAt: '2023-01-04T13:21:09.342Z',
      createdBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      },
      updatedBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      },
      publishedCounter: 1,
      version: 2,
      publishedBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '3WlUR1oXESaoI9OjI52jWA'
        }
      }
    },
    displayField: 'title',
    name: 'Blurhash Image',
    description: 'Hello this a new description',
    fields: [
      {
        id: 'title',
        name: 'Title',
        type: 'Symbol',
        localized: false,
        required: true,
        validations: [],
        defaultValue: {
          'en-US': 'New Blurhash Image'
        },
        disabled: false,
        omitted: false
      },
      {
        id: 'image',
        name: 'Image',
        type: 'Link',
        localized: false,
        required: true,
        validations: [],
        disabled: false,
        omitted: false,
        linkType: 'Asset'
      },
      {
        id: 'newid',
        name: 'Blurhash',
        type: 'Symbol',
        localized: false,
        required: true,
        validations: [],
        disabled: false,
        omitted: false
      }
    ]
  }
]
export const ChangesetItemsMock: ChangesetItem[] = [
  {
    changeType: 'add',
    entity: {
      sys: {
        id: 'product',
        linkType: 'ContentType',
        type: 'Link'
      }
    },
    data: {
      displayField: 'name',
      name: 'Product',
      description: '',
      fields: [
        {
          id: 'name',
          name: 'name',
          type: 'Symbol',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        },
        {
          id: 'price',
          name: 'price',
          type: 'Number',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        },
        {
          id: 'referenceCode',
          name: 'reference-code',
          type: 'Symbol',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        }
      ]
    }
  },
  {
    changeType: 'delete',
    entity: {
      sys: {
        id: 'toBeDeletedContentType',
        linkType: 'ContentType',
        type: 'Link'
      }
    }
  },
  {
    changeType: 'add',
    entity: {
      sys: {
        id: 'simpleContentType',
        linkType: 'ContentType',
        type: 'Link'
      }
    },
    data: {
      displayField: 'title',
      name: 'simple content type',
      description: '',
      fields: [
        {
          id: 'age',
          name: 'age',
          type: 'Integer',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        },
        {
          id: 'title',
          name: 'title',
          type: 'Symbol',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        },
        {
          id: 'name',
          name: 'name',
          type: 'Symbol',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        }
      ]
    }
  },
  {
    changeType: 'update',
    entity: {
      sys: {
        id: 'secondContentType',
        linkType: 'ContentType',
        type: 'Link'
      }
    },
    patch: [
      {
        op: 'replace',
        path: '/description',
        value: 'This is a new description'
      },
      {
        op: 'replace',
        path: '/name',
        value: 'Second Content typeeee'
      },
      {
        op: 'replace',
        path: '/fields/3/omitted',
        value: true
      },
      { op: 'move', from: '/fields/0', path: '/fields/1' },
      { op: 'move', from: '/fields/3', path: '/fields/2' }
    ]
  },
  {
    changeType: 'update',
    entity: {
      sys: {
        id: 'firstContentType',
        linkType: 'ContentType',
        type: 'Link'
      }
    },
    patch: [
      {
        op: 'replace',
        path: '/displayField',
        value: 'aSimpleTextFieldChanged'
      },
      {
        op: 'remove',
        path: '/fields/0'
      },
      {
        op: 'add',
        path: '/fields/0',
        value: {
          id: 'aSimpleTextFieldChanged',
          name: 'A Simple Text field - with a new name',
          type: 'Symbol',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        }
      },
      {
        op: 'add',
        path: '/fields/2',
        value: {
          id: 'image',
          name: 'image',
          type: 'Link',
          localized: false,
          required: false,
          validations: [
            {
              linkContentType: ['blurhashImage']
            }
          ],
          disabled: false,
          omitted: false,
          linkType: 'Entry'
        }
      }
    ]
  }
]
