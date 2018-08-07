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

beforeAll(() => {
  finishStepRewireApi.__Rewire__('log', stub())
  finishStepRewireApi.__Rewire__('wrappedLog', stub())
  finishStepRewireApi.__Rewire__('success', successStub)
  finishStepRewireApi.__Rewire__('readFile', readFileStub)
  finishStepRewireApi.__Rewire__('createManagementClient', createManagementClientStub)
})

afterEach(() => {
  successStub.resetHistory()
  readFileStub.resetHistory()
  guideContext.stepCount = 0
})

afterAll(() => {
  finishStepRewireApi.__ResetDependency__('log')
  finishStepRewireApi.__ResetDependency__('wrappedLog')
  finishStepRewireApi.__ResetDependency__('success')
  finishStepRewireApi.__ResetDependency__('readFile')
  finishStepRewireApi.__ResetDependency__('createManagementClient')
})

test('calls success and reads whats-next.md', async () => {
  await finishStep(guideContext)
  expect(readFileStub.calledOnce).toBe(true)
  expect(readFileStub.args[0][0]).toBe(join(guideContext.installationDirectory, 'WHATS-NEXT.MD'))
  expect(successStub.calledOnce).toBe(true)
})

test('catches errors and does nothing', async () => {
  readFileStub.rejects(new Error('random'))
  await expect(finishStep(guideContext)).not.toThrow()
  readFileStub.resolves(true)
})
