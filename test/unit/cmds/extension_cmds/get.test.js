const { handler } = require('../../../../lib/cmds/extension_cmds/get')

const { log } = require('../../../../lib/utils/log')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients')

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/contentful-clients')

const getUiExtensionStub = jest.fn().mockResolvedValue({
  extension: {
    name: 'Widget',
    fieldTypes: [
      { type: 'Symbol' },
      { type: 'Array', items: { type: 'Symbol' } }
    ],
    src: 'https://awesome.extension'
  },
  sys: { id: '123', version: 3 }
})

const fakeClient = {
  getSpace: async () => ({
    getEnvironment: async () => ({
      getUiExtension: getUiExtensionStub
    })
  })
}
createManagementClient.mockResolvedValue(fakeClient)

beforeEach(() => {
  log.mockClear()
  createManagementClient.mockClear()
})

test('Calls getUiExtension() with ID', async () => {
  await handler({
    context: {
      activeSpaceId: 'space1',
      activeEnvironmentId: 'master',
      managementToken: 'token'
    },
    id: 'widget1'
  })

  expect(getUiExtensionStub).toHaveBeenCalledWith('widget1')
})

test('Logs extension data', async () => {
  await handler({
    context: {
      activeSpaceId: 'space1',
      activeEnvironmentId: 'master',
      managementToken: 'token'
    },
    id: 'widget1'
  })

  const outputValues = [
    '123',
    'Widget',
    'Symbol, Symbols',
    'https://awesome.extension'
  ]

  expect(log.mock.calls[0][0]).toContain('Space: space1')
  expect(log.mock.calls[1][0]).toContain('Environment: master')
  expect(log.mock.calls[2][0]).toContain(
    'Your extension: https://app.contentful.com/spaces/space1/settings/extensions/123'
  )
  outputValues.forEach(str => {
    expect(log.mock.calls[3][0]).toContain(str)
  })
})
