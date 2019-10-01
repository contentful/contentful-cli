const finishStep = require('../../../lib/guide/step-finish')

const { join } = require('path')
const fs = require('fs')
const { success } = require('../../../lib/utils/log')
const {
  createManagementClient
} = require('../../../lib/utils/contentful-clients')

jest.mock('../../../lib/utils/log')
jest.mock('../../../lib/utils/contentful-clients')
jest.spyOn(fs, 'readFileSync')

const guideContext = {
  stepCount: 0,
  spaceId: 'abc124',
  installationDirectory: '/my/directory',
  activeGuide: {
    seed: 'test'
  }
}

createManagementClient.mockResolvedValue({
  getSpace: async () => ({
    getEnvironment: async () => ({
      getEntries: async () => ({
        items: []
      })
    })
  })
})

afterEach(() => {
  success.mockClear()
  guideContext.stepCount = 0
})

test('calls success and reads whats-next.md', async () => {
  fs.readFileSync.mockClear()
  await finishStep(guideContext)
  expect(fs.readFileSync).toHaveBeenCalledTimes(1)
  expect(fs.readFileSync.mock.calls[0][0]).toBe(
    join(guideContext.installationDirectory, 'WHATS-NEXT.MD')
  )
  expect(success).toHaveBeenCalledTimes(1)
})

test('catches errors and does nothing', async () => {
  fs.readFileSync.mockImplementationOnce(() => {
    throw new Error('random')
  })
  await finishStep(guideContext)
})
