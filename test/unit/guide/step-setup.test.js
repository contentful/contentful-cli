const setupStep = require('../../../lib/guide/step-setup')
const { join } = require('path')

const { getContext } = require('../../../lib/context')
const {
  accessTokenCreate
} = require('../../../lib/cmds/space_cmds/accesstoken_cmds/create')
const { prompt } = require('inquirer')
const execa = require('execa')

jest.mock('../../../lib/context')
jest.mock('../../../lib/utils/log')
jest.mock('../../../lib/utils/github')
jest.mock('../../../lib/cmds/space_cmds/accesstoken_cmds/create')
jest.mock('execa')
jest.mock('inquirer')

prompt.mockResolvedValue({ directoryName: 'test', directoryPath: 'test-path' })
accessTokenCreate.mockResolvedValue({ accessToken: 'abc123' })
getContext.mockResolvedValue({ managementToken: 'abc124' })
const setupConfig = jest.fn().mockResolvedValue()

const guideContext = {
  stepCount: 0,
  spaceId: 'abc124',
  activeGuide: {
    seed: 'test',
    directoryName: 'dirname',
    setupConfig: setupConfig
  }
}

afterEach(() => {
  guideContext.stepCount = 0
  accessTokenCreate.mockClear()
  getContext.mockClear()
  execa.mockClear()
  prompt.mockClear()
  guideContext.activeGuide.setupConfig.mockClear()
})

test('inquirer prompts for directory name and path', async () => {
  await setupStep(guideContext)
  expect(prompt).toHaveBeenCalledTimes(2)
  expect(prompt.mock.calls[0][0][0].name).toBe('directoryName')
  expect(prompt.mock.calls[1][0][0].name).toBe('directoryPath')
})

test('guideContext stepCount incremented', async () => {
  const stepCount = guideContext.stepCount
  await setupStep(guideContext)
  expect(guideContext.stepCount).toBe(stepCount + 1)
})

test('checks for yarn, execa installs, creates cda token', async () => {
  await setupStep(guideContext)
  expect(execa).toHaveBeenCalledTimes(1)
  expect(accessTokenCreate).toHaveBeenCalledTimes(1)
})

test('gets context and sets up config', async () => {
  await setupStep(guideContext)
  expect(getContext).toHaveBeenCalledTimes(2)
  expect(guideContext.activeGuide.setupConfig).toHaveBeenCalledTimes(1)
})

test('sets guideContext installation directory', async () => {
  await setupStep(guideContext)
  expect(guideContext.installationDirectory).toBe(join('test-path', 'test'))
})
