const { version } = require('../../../package.json')
const {
  createManagementClient
} = require('../../../lib/utils/contentful-clients.cjs')
const cma = require('contentful-management')

jest.mock('contentful-management', () => ({ createClient: jest.fn() }))

test('set the correct application name and version', async () => {
  await createManagementClient({ accessToken: 'accessToken' })
  expect(cma.createClient).toHaveBeenCalledTimes(1)
  expect(cma.createClient.mock.calls[0][0].application).toMatch(
    new RegExp(`contentful.cli/${version}`, 'g')
  )
})
