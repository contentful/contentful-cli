import { stub } from 'sinon'
import { AbortedError } from '../../../lib/guide/helpers'
import createSpaceStep,
{ __RewireAPI__ as createSpaceStepRewireApi} from '../../../lib/guide/step-create-space'

const guideContext = {stepCount: 0, activeGuide: {name: 'test'}}
const fakeSpace = {sys: {id: '100abc'}}
const confirmationStub = stub().resolves(true)
const spaceCreateStub = stub().resolves(fakeSpace)

beforeAll(() => {
  createSpaceStepRewireApi.__Rewire__('confirmation', confirmationStub)
  createSpaceStepRewireApi.__Rewire__('spaceCreate', spaceCreateStub)
  createSpaceStepRewireApi.__Rewire__('wrappedLog', stub())
  createSpaceStepRewireApi.__Rewire__('log', stub())
})

afterEach(() => {
  confirmationStub.resetHistory()
  spaceCreateStub.resetHistory()
  guideContext.stepCount = 0
})

afterAll(() => {
  createSpaceStepRewireApi.__ResetDependency__('confirmation')
  createSpaceStepRewireApi.__ResetDependency__('spaceCreate')
  createSpaceStepRewireApi.__ResetDependency__('wrappedLog')
  createSpaceStepRewireApi.__ResetDependency__('log')
})

test('creates space on successful user confirmation', async () => {
  await createSpaceStep(guideContext)
  expect(confirmationStub.calledOnce).toBe(true)
  expect(spaceCreateStub.calledOnce).toBe(true)
  expect(
    spaceCreateStub.calledWith({name: guideContext.activeGuide.name, feature: 'guide'})
  ).toBe(true)
})

test('guideContext stepCount incremented', async () => {
  const stepCount = guideContext.stepCount
  await createSpaceStep(guideContext)
  expect(guideContext.stepCount).toBe(stepCount + 1)
})

test('guideContext spaceId gets set after spaceCreation', async () => {
  await createSpaceStep(guideContext)
  expect(guideContext.spaceId).toBe(fakeSpace.sys.id)
})

test('throws AbortedError if user does not confirm', async () => {
  confirmationStub.resolves(false)
  try {
    await expect(createSpaceStep(guideContext)).rejects.toThrowError(AbortedError)
  } catch (e) {}
  confirmationStub.resolves(true)
})
