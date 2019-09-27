const { handler } = require('../../../../lib/cmds/extension_cmds/list')

const { log } = require('../../../../lib/utils/log')
const {
  createManagementClient
} = require('../../../../lib/utils/contentful-clients')

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/contentful-clients')

const mockExtensions = {
  items: [
    {
      extension: {
        name: 'Widget',
        fieldTypes: [
          { type: 'Symbol' },
          { type: 'Array', items: { type: 'Symbol' } }
        ],
        src: 'https://awesome.extension'
      },
      sys: { id: '123', version: 7 }
    },
    {
      extension: {
        name: 'Widget 2',
        fieldTypes: [{ type: 'Entry' }, { type: 'Number' }],
        src: 'https://awesome.extension'
      },
      sys: { id: '456', version: 8 }
    }
  ]
}

const defaults = {
  context: {
    managementToken: 'management-token',
    activeSpaceId: 'space',
    activeEnvironmentId: 'env'
  }
}

const getEnvironmentStub = jest.fn().mockImplementation(environmentId => {
  if (environmentId === 'env') {
    return Promise.resolve({
      getUiExtensions: () => Promise.resolve(mockExtensions)
    })
  }
  return Promise.resolve({
    getUiExtensions: () => Promise.resolve({ items: [] })
  })
})

const fakeClient = {
  getSpace: async () => ({
    getEnvironment: getEnvironmentStub
  })
}
createManagementClient.mockResolvedValue(fakeClient)

beforeEach(() => {
  log.mockClear()
  createManagementClient.mockClear()
})

test('Lists extensions', async () => {
  await handler(defaults)

  const outputValues = ['Widget', '123', '7', 'Widget 2', '456', '8']

  outputValues.forEach(str => {
    expect(log.mock.calls[0][0]).toContain(str)
  })
})

test('Displays message if list is empty', async () => {
  await handler({
    context: { ...defaults.context, activeEnvironmentId: 'empty' }
  })

  expect(log).toHaveBeenCalledWith('No extensions found')
})
