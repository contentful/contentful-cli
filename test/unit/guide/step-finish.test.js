import test from 'ava'
import { stub } from 'sinon'
import finishStep,
{ __RewireAPI__ as finishStepRewireApi } from '../../../lib/guide/step-finish'
import { join } from 'path'

const guideContext = {
  stepCount: 0,
  spaceId: 'abc124',
  installationDirectory: '/my/directory',
  activeGuide: {
    seed: 'test'
  }
}
const successStub = stub()
const readFileStub = stub().resolves('resolved')
const environmentStub = stub().resolves({getEntries: stub().resolves({items: []})})
const clientStub = {
  getSpace: stub().resolves({getEnvironment: environmentStub})
}
const createManagementClientStub = stub().resolves(clientStub)

test.before(() => {
  finishStepRewireApi.__Rewire__('log', stub())
  finishStepRewireApi.__Rewire__('wrappedLog', stub())
  finishStepRewireApi.__Rewire__('success', successStub)
  finishStepRewireApi.__Rewire__('readFile', readFileStub)
  finishStepRewireApi.__Rewire__('createManagementClient', createManagementClientStub)
})

test.afterEach(() => {
  successStub.resetHistory()
  readFileStub.resetHistory()
  guideContext.stepCount = 0
})

test.after.always(() => {
  finishStepRewireApi.__ResetDependency__('log')
  finishStepRewireApi.__ResetDependency__('wrappedLog')
  finishStepRewireApi.__ResetDependency__('success')
  finishStepRewireApi.__ResetDependency__('readFile')
  finishStepRewireApi.__ResetDependency__('createManagementClient')
})

test.serial('calls success and reads whats-next.md', async (t) => {
  await finishStep(guideContext)
  t.true(readFileStub.calledOnce, 'readFile called')
  t.is(readFileStub.args[0][0], join(guideContext.installationDirectory, 'WHATS-NEXT.MD'), 'reading correct whats-next file')
  t.true(successStub.calledOnce, 'success called once')
})

test.serial('catches errors and does nothing', async (t) => {
  readFileStub.rejects(new Error('random'))
  await t.notThrows(finishStep(guideContext))
  readFileStub.resolves(true)
})
