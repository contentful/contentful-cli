import { stub } from 'sinon'
import setupStep,
{ __RewireAPI__ as setupStepRewireApi } from '../../../lib/guide/step-setup'
import { join } from 'path'

const promptStub = stub().resolves({directoryName: 'test', directoryPath: 'test-path'})
const githubReleaseStub = stub().resolves()
const accessTokenCreateStub = stub().resolves({accessToken: 'abc123'})
const execaStub = stub().resolves(true)
const getContextStub = stub().resolves({cmaToken: 'abc124'})
const setupConfigStub = stub().resolves()

const guideContext = {
  stepCount: 0,
  spaceId: 'abc124',
  activeGuide: {
    seed: 'test',
    directoryName: 'dirname',
    setupConfig: setupConfigStub
  }
}
beforeAll(() => {
  setupStepRewireApi.__Rewire__('log', stub())
  setupStepRewireApi.__Rewire__('wrappedLog', stub())
  setupStepRewireApi.__Rewire__('inquirer', {prompt: promptStub})
  setupStepRewireApi.__Rewire__('getLatestGitHubRelease', githubReleaseStub)
  setupStepRewireApi.__Rewire__('accessTokenCreate', accessTokenCreateStub)
  setupStepRewireApi.__Rewire__('execa', execaStub)
  setupStepRewireApi.__Rewire__('getContext', getContextStub)
})

afterEach(() => {
  guideContext.stepCount = 0
  execaStub.resetHistory()
  accessTokenCreateStub.resetHistory()
  getContextStub.resetHistory()
  guideContext.activeGuide.setupConfig.resetHistory()
})

afterAll(() => {
  ['inquirer', 'getLatestGitHubRelease', 'accessTokenCreate', 'execa', 'getContext'].map(stub => {
    setupStepRewireApi.__ResetDependency__(stub)
  })
  setupStepRewireApi.__ResetDependency__('log')
  setupStepRewireApi.__ResetDependency__('wrappedLog')
})

test('inquirer prompts for directory name and path', async () => {
  await setupStep(guideContext)
  expect(promptStub.calledTwice).toBe(true)
  expect(promptStub.args[0][0][0].name).toBe('directoryName')
  expect(promptStub.args[1][0][0].name).toBe('directoryPath')
})

test('guideContext stepCount incremented', async () => {
  const stepCount = guideContext.stepCount
  await setupStep(guideContext)
  expect(guideContext.stepCount).toBe(stepCount + 1)
})

test('checks for yarn, execa installs, creates cda token', async () => {
  await setupStep(guideContext)
  expect(execaStub.calledOnce).toBe(true)
  expect(accessTokenCreateStub.calledOnce).toBe(true)
})

test('gets context and sets up config', async () => {
  await setupStep(guideContext)
  expect(getContextStub.calledOnce).toBe(true)
  expect(guideContext.activeGuide.setupConfig.calledOnce).toBe(true)
})

test('sets guideContext installation directory', async () => {
  await setupStep(guideContext)
  expect(guideContext.installationDirectory).toBe(join('test-path', 'test'))
})
