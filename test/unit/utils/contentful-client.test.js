const { version } = require('../../../package.json')
const {
  createManagementClient
} = require('../../../lib/utils/contentful-clients')
const { createClient } = require('contentful-management')

jest.mock('contentful-management', () => ({ createClient: jest.fn() }))

test('set the correct application name and version', async () => {
  await createManagementClient({ accessToken: 'accessToken' })
  expect(createClient).toHaveBeenCalledTimes(1)
  expect(createClient.mock.calls[0][0].application).toMatch(
    new RegExp(`contentful.cli/${version}`, 'g')
  )
})
