const { guide } = require('../../../lib/cmds/guide')
const { AbortedError } = require('../../../lib/guide/helpers')

const loginStep = require('../../../lib/guide/step-login')
const createSpaceStep = require('../../../lib/guide/step-create-space')
const seedStep = require('../../../lib/guide/step-seed')
const setupStep = require('../../../lib/guide/step-setup')
const devServerStep = require('../../../lib/guide/step-dev-server')
const finishStep = require('../../../lib/guide/step-finish')

jest.mock('../../../lib/guide/step-login')
jest.mock('../../../lib/guide/step-create-space')
jest.mock('../../../lib/guide/step-seed')
jest.mock('../../../lib/guide/step-setup')
jest.mock('../../../lib/guide/step-dev-server')
jest.mock('../../../lib/guide/step-finish')
jest.mock('../../../lib/utils/log')

const stubs = [
  loginStep,
  createSpaceStep,
  seedStep,
  setupStep,
  devServerStep,
  finishStep
]

afterEach(() => {
  loginStep.mockClear()
  createSpaceStep.mockClear()
  seedStep.mockClear()
  setupStep.mockClear()
  devServerStep.mockClear()
  finishStep.mockClear()
})

test('guide cmd calls every step', async () => {
  await guide()
  stubs.map(stub => {
    expect(stub).toHaveBeenCalledTimes(1)
    expect(stub.mock.calls[0][0].activeGuide).toBeTruthy()
  })
})

test('handles errors correctly in loginStep', async () => {
  loginStep.mockRejectedValueOnce(new AbortedError())
  await guide()
  loginStep.mockRejectedValueOnce(new Error('Something broke'))
  await expect(guide()).rejects.toThrowErrorMatchingSnapshot()
})

test('handles errors correctly in createSpaceStep', async () => {
  createSpaceStep.mockRejectedValueOnce(new AbortedError())
  await guide()
  createSpaceStep.mockRejectedValueOnce(new Error('Something broke'))
  await expect(guide()).rejects.toThrowErrorMatchingSnapshot()
})

test('handles errors correctly in seedStep', async () => {
  seedStep.mockRejectedValueOnce(new AbortedError())
  await guide()
  seedStep.mockRejectedValueOnce(new Error('Something broke'))
  await expect(guide()).rejects.toThrowErrorMatchingSnapshot()
})

test('handles errors correctly in setupStep', async () => {
  setupStep.mockRejectedValueOnce(new AbortedError())
  await guide()
  setupStep.mockRejectedValueOnce(new Error('Something broke'))
  await expect(guide()).rejects.toThrowErrorMatchingSnapshot()
})

test('handles errors correctly in devServerStep', async () => {
  devServerStep.mockRejectedValueOnce(new AbortedError())
  await guide()
  expect(finishStep).toHaveBeenCalledTimes(1)
  devServerStep.mockRejectedValueOnce(new Error('Something broke'))
  await expect(guide()).rejects.toThrowErrorMatchingSnapshot()
  expect(finishStep.calledOnce).toBeFalsy()
})
