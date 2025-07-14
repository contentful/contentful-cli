const fs = require('fs')
const path = require('path')
const runContentfulExport = require('contentful-export')
const runContentfulImport = require('contentful-import')
const { version } = require('../../../../package.json')

jest.mock('fs')
jest.mock('path')
jest.mock('contentful-export')
jest.mock('contentful-import')
jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/headers', () => ({
  getHeadersFromOption: jest.fn(() => ({}))
}))
jest.mock('../../../../lib/cmds/organization_cmds/export', () => ({
  organizationExport: jest.fn()
}))
jest.mock('../../../../lib/cmds/organization_cmds/import', () => ({
  organizationImport: jest.fn()
}))
jest.mock('emojic', () => ({
  whiteCheckMark: '✅',
  inboxTray: '📥',
  tada: '🎉'
}))

const {
  organizationExport
} = require('../../../../lib/cmds/organization_cmds/export')
const {
  organizationImport
} = require('../../../../lib/cmds/organization_cmds/import')
const { migrateRegion } = require('../../../../lib/cmds/sync_cmds/region')

describe('migrateRegion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fs.existsSync.mockReturnValue(false)
    fs.mkdirSync.mockImplementation(() => {})
    path.join.mockImplementation((...parts) => parts.join('/'))
    runContentfulExport.mockResolvedValue({})
    runContentfulImport.mockResolvedValue({})
  })

  test('runs export and import without taxonomies', async () => {
    const argv = {
      source: 'eu',
      target: 'na',
      sourceSpaceId: 'sourceSpaceId',
      targetSpaceId: 'targetSpaceId',
      sourceToken: 'sourceToken',
      targetToken: 'targetToken',
      environmentId: 'master',
      useVerboseRenderer: false,
      includeTaxonomies: false,
      header: []
    }

    await migrateRegion(argv)

    expect(runContentfulExport).toHaveBeenCalledWith(
      expect.objectContaining({
        spaceId: 'sourceSpaceId',
        environmentId: 'master',
        managementToken: 'sourceToken',
        host: 'api.eu.contentful.com',
        useVerboseRenderer: false,
        managementApplication: `contentful.cli/${version}`,
        managementFeature: 'migrate-region'
      })
    )

    expect(runContentfulImport).toHaveBeenCalledWith(
      expect.objectContaining({
        spaceId: 'targetSpaceId',
        environmentId: 'master',
        managementToken: 'targetToken',
        host: 'api.contentful.com',
        useVerboseRenderer: false,
        managementApplication: `contentful.cli/${version}`,
        managementFeature: 'migrate-region'
      })
    )

    expect(organizationExport).not.toHaveBeenCalled()
    expect(organizationImport).not.toHaveBeenCalled()
  })

  test('runs taxonomy export/import when includeTaxonomies is true', async () => {
    const argv = {
      source: 'na',
      target: 'eu',
      sourceSpaceId: 'sourceSpaceId',
      targetSpaceId: 'targetSpaceId',
      sourceToken: 'sourceToken',
      targetToken: 'targetToken',
      environmentId: 'master',
      useVerboseRenderer: true,
      includeTaxonomies: true,
      sourceOrgId: 'srcOrg',
      targetOrgId: 'tgtOrg',
      header: []
    }

    await migrateRegion(argv)

    expect(organizationExport).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'srcOrg',
        context: { managementToken: 'sourceToken' },
        host: 'api.eu.contentful.com' 
      })
    )

    expect(organizationImport).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'tgtOrg',
        context: { managementToken: 'targetToken' },
        host: 'api.eu.contentful.com'
      })
    )

    expect(runContentfulExport).toHaveBeenCalled()
    expect(runContentfulImport).toHaveBeenCalled()
  })

  test('throws if includeTaxonomies is true but org IDs are missing', async () => {
    const argv = {
      source: 'na',
      target: 'eu',
      sourceSpaceId: 'sourceSpaceId',
      targetSpaceId: 'targetSpaceId',
      sourceToken: 'sourceToken',
      targetToken: 'targetToken',
      environmentId: 'master',
      useVerboseRenderer: false,
      includeTaxonomies: true,
      header: []
    }

    await expect(migrateRegion(argv)).rejects.toThrow(
      '--source-org-id and --target-org-id are required when --include-taxonomies is set'
    )
  })
})
