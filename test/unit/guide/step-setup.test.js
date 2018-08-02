import test from 'ava'
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
test.before(() => {
  setupStepRewireApi.__Rewire__('log', stub())
  setupStepRewireApi.__Rewire__('wrappedLog', stub())
  setupStepRewireApi.__Rewire__('inquirer', {prompt: promptStub})
  setupStepRewireApi.__Rewire__('getLatestGitHubRelease', githubReleaseStub)
  setupStepRewireApi.__Rewire__('accessTokenCreate', accessTokenCreateStub)
  setupStepRewireApi.__Rewire__('execa', execaStub)
  setupStepRewireApi.__Rewire__('getContext', getContextStub)
})

test.afterEach(() => {
  guideContext.stepCount = 0
  execaStub.resetHistory()
  accessTokenCreateStub.resetHistory()
  getContextStub.resetHistory()
  guideContext.activeGuide.setupConfig.resetHistory()
})

test.after.always(() => {
  ['inquirer', 'getLatestGitHubRelease', 'accessTokenCreate', 'execa', 'getContext'].map(stub => {
    setupStepRewireApi.__ResetDependency__(stub)
  })
  setupStepRewireApi.__ResetDependency__('log')
  setupStepRewireApi.__ResetDependency__('wrappedLog')
})

test.serial('inquirer prompts for directory name and path', async (t) => {
  await setupStep(guideContext)
  t.true(promptStub.calledTwice, 'prompt stub called twice')
  t.is(promptStub.args[0][0][0].name, 'directoryName', 'first prompt is for directoryName')
  t.is(promptStub.args[1][0][0].name, 'directoryPath', 'second prompt is for directoryPath')
})

test.serial('guideContext stepCount incremented', async (t) => {
  const stepCount = guideContext.stepCount
  await setupStep(guideContext)
  t.is(guideContext.stepCount, stepCount + 1)
})

test.serial('checks for yarn, execa installs, creates cda token', async (t) => {
  await setupStep(guideContext)
  t.true(execaStub.calledOnce)
  t.true(accessTokenCreateStub.calledOnce)
})

test.serial('gets context and sets up config', async (t) => {
  await setupStep(guideContext)
  t.true(getContextStub.calledOnce)
  t.true(guideContext.activeGuide.setupConfig.calledOnce)
})

test.serial('sets guideContext installation directory', async (t) => {
  await setupStep(guideContext)
  t.is(guideContext.installationDirectory, join('test-path', 'test'))
})
