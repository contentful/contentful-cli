import { handler } from '../../../../lib/cmds/extension_cmds/list'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'

import { log } from '../../../../lib/utils/log'
import { createManagementClient } from '../../../../lib/utils/contentful-clients'

jest.mock('../../../../lib/utils/log')
jest.mock('../../../../lib/utils/contentful-clients')

const mockExtensions = {
  items: [
    {
      extension: {
        name: 'Widget',
        fieldTypes: [{ type: 'Symbol' }, { type: 'Array', items: { type: 'Symbol' } }],
        src: 'https://awesome.extension'
      },
      sys: { id: '123', version: 7 }
    }, {
      extension: {
        name: 'Widget 2',
        fieldTypes: [{ type: 'Entry' }, { type: 'Number' }],
        src: 'https://awesome.extension'
      },
      sys: { id: '456', version: 8 }
    }
  ]
}

const getEnvironmentStub = jest.fn().mockImplementation((environmentId) => {
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

beforeAll(() => {
  emptyContext()
  setContext({
    cmaToken: 'mockedToken',
    activeSpaceId: 'someSpaceId'
  })
})

beforeEach(() => {
  log.mockClear()
  createManagementClient.mockClear()
})

test('Lists extensions', async () => {
  await handler({spaceId: 'space', environmentId: 'env'})

  const outputValues = [ 'Widget', '123', '7', 'Widget 2', '456', '8' ]

  outputValues.forEach(str => {
    expect(log.mock.calls[0][0]).toContain(str)
  })
})

test('Displays message if list is empty', async () => {
  await handler({spaceId: 'space', environmentId: 'empty'})

  expect(log).toHaveBeenCalledWith('No extensions found')
})
