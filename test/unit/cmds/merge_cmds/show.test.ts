import { ContentTypeProps, PlainClientAPI } from 'contentful-management'
import * as appInstallUtils from '../../../../lib/utils/app-installation'
import { ContentTypeApiHelper } from '../../../../lib/utils/merge/content-type-api-helper'
import * as printer from '../../../../lib/utils/merge/print-changeset-messages'
import * as showCmd from '../../../../lib/cmds/merge_cmds/show'
import { ChangesetItem } from '../../../../lib/utils/merge/types'

const mockedClient = {
  appInstallation: {
    get: jest.fn()
  },
  raw: {
    put: jest.fn(),
    getDefaultParams: jest.fn()
  },
  environmentAlias: {
    getMany: jest.fn().mockResolvedValue({ items: [] })
  }
} as unknown as PlainClientAPI

const showTestData = {
  targetContentType: [
    {
      sys: {
        space: {
          sys: {
            type: 'Link',
            linkType: 'Space',
            id: 't7gnd9bsbzjy'
          }
        },
        id: 'newType',
        type: 'ContentType',
        createdAt: '2023-03-08T10:10:17.036Z',
        updatedAt: '2023-03-08T10:10:17.419Z',
        environment: {
          sys: {
            id: 'master-copy',
            type: 'Link',
            linkType: 'Environment'
          }
        },
        publishedVersion: 1,
        publishedAt: '2023-03-08T10:10:17.419Z',
        firstPublishedAt: '2023-03-08T10:10:17.419Z',
        createdBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        },
        updatedBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        },
        publishedCounter: 1,
        version: 2,
        publishedBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        }
      },
      displayField: null,
      name: 'NewType',
      description: '',
      fields: [
        {
          id: 'json',
          name: 'JSON',
          type: 'Object',
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
            id: 't7gnd9bsbzjy'
          }
        },
        id: 'toBeModifiedType',
        type: 'ContentType',
        createdAt: '2023-03-08T09:58:22.386Z',
        updatedAt: '2023-03-08T10:09:57.460Z',
        environment: {
          sys: {
            id: 'master-copy',
            type: 'Link',
            linkType: 'Environment'
          }
        },
        publishedVersion: 3,
        publishedAt: '2023-03-08T10:09:57.460Z',
        firstPublishedAt: '2023-03-08T09:58:22.664Z',
        createdBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        },
        updatedBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        },
        publishedCounter: 2,
        version: 4,
        publishedBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        }
      },
      displayField: null,
      name: 'ToBeModifiedType',
      description: '',
      fields: [
        {
          id: 'yes',
          name: 'No',
          type: 'Boolean',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        },
        {
          id: 'number',
          name: 'number',
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
            id: 't7gnd9bsbzjy'
          }
        },
        id: 'test',
        type: 'ContentType',
        createdAt: '2023-03-08T09:57:34.554Z',
        updatedAt: '2023-03-08T09:57:34.963Z',
        environment: {
          sys: {
            id: 'master-copy',
            type: 'Link',
            linkType: 'Environment'
          }
        },
        publishedVersion: 1,
        publishedAt: '2023-03-08T09:57:34.963Z',
        firstPublishedAt: '2023-03-08T09:57:34.963Z',
        createdBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        },
        updatedBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        },
        publishedCounter: 1,
        version: 2,
        publishedBy: {
          sys: {
            type: 'Link',
            linkType: 'User',
            id: '6P6JYCRMBgoOlkFeF4Y45c'
          }
        }
      },
      displayField: 'textField',
      name: 'Test',
      description: '',
      fields: [
        {
          id: 'textField',
          name: 'Text Field',
          type: 'Symbol',
          localized: false,
          required: false,
          validations: [],
          disabled: false,
          omitted: false
        }
      ]
    }
  ],
  changeset: [
    {
      changeType: 'add',
      entity: {
        sys: {
          id: 'toBeDeletedType',
          linkType: 'ContentType',
          type: 'Link'
        }
      },
      data: {
        displayField: null,
        name: 'ToBeDeletedType',
        description: '',
        fields: [
          {
            id: 'number',
            name: 'Number',
            type: 'Integer',
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
          id: 'newType',
          linkType: 'ContentType',
          type: 'Link'
        }
      }
    },
    {
      changeType: 'update',
      entity: {
        sys: {
          id: 'toBeModifiedType',
          linkType: 'ContentType',
          type: 'Link'
        }
      },
      patch: [
        {
          op: 'remove',
          path: '/fields/1'
        },
        {
          op: 'replace',
          path: '/fields/0/name',
          value: 'yes'
        },
        {
          op: 'add',
          path: '/fields/1',
          value: {
            id: 'numberEditted',
            name: 'number-editted',
            type: 'Integer',
            localized: false,
            required: false,
            validations: [],
            disabled: false,
            omitted: false
          }
        }
      ]
    }
  ]
}

describe('merge show command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stops early if both env have the app installed', async () => {
    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        false
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(mockedClient.appInstallation.get).toHaveBeenCalledTimes(2)
  })

  it('installs app to both envs if none of them have it installed', async () => {
    mockedClient.appInstallation.get = jest.fn().mockImplementationOnce(() => {
      throw { name: 'NotFound' }
    })

    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        true
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(mockedClient.appInstallation.get).toHaveBeenCalledTimes(2)
    expect(mockedClient.raw.put).toHaveBeenCalledTimes(2)
  })

  it('installs the app in the other env if only one has it installed', async () => {
    const appInstalledInBothEnvs =
      await appInstallUtils.checkAndInstallAppInEnvironments(
        mockedClient,
        'space',
        ['source', 'target'],
        'app-id',
        true
      )

    expect(appInstalledInBothEnvs).toBe(true)
    expect(mockedClient.appInstallation.get).toHaveBeenCalledTimes(2)
  })

  it('call the create changeset actions', async () => {
    mockedClient.appActionCall = {
      create: jest.fn().mockResolvedValueOnce({
        sys: {
          id: 'action-id-create-changeset'
        }
      }),
      getCallDetails: jest.fn().mockResolvedValueOnce({
        statusCode: 200,
        response: {
          body: '{"message": {"changeset":"[]"}}'
        }
      })
    }

    jest
      .spyOn(ContentTypeApiHelper, 'getAll')
      .mockResolvedValueOnce([{}] as ContentTypeProps[])

    await showCmd.getChangesetAndTargetContentType({
      client: mockedClient,
      activeSpaceId: 'space',
      host: 'api.flinkly.com',
      appDefinitionId: 'app-id',
      sourceEnvironmentId: 'source',
      targetEnvironmentId: 'target'
    })

    expect(mockedClient.appActionCall.create).toHaveBeenCalledTimes(1)
    expect(ContentTypeApiHelper.getAll).toHaveBeenCalledTimes(1)
  })
})
