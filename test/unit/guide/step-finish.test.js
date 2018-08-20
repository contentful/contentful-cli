import finishStep from '../../../lib/guide/step-finish'

import { join } from 'path'
import fs from 'fs'
import { success } from '../../../lib/utils/log'
import { createManagementClient } from '../../../lib/utils/contentful-clients'

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
  await finishStep(guideContext)
  expect(fs.readFileSync).toHaveBeenCalledTimes(1)
  expect(fs.readFileSync.mock.calls[0][0]).toBe(join(guideContext.installationDirectory, 'WHATS-NEXT.MD'))
  expect(success).toHaveBeenCalledTimes(1)
})

test('catches errors and does nothing', async () => {
  fs.readFileSync.mockImplementationOnce(() => {
    throw new Error('random')
  })
  await finishStep(guideContext)
})
