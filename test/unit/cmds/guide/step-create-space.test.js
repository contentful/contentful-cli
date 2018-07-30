import test from 'ava'
import { stub } from 'sinon'
import { AbortedError } from '../../../../lib/cmds/guide/helpers'
import createSpaceStep,
{ __RewireAPI__ as createSpaceStepRewireApi} from '../../../../lib/cmds/guide/step-create-space'

const guideContext = {stepCount: 0, activeGuide: {name: 'test'}}
const fakeSpace = {sys: {id: '100abc'}}
const confirmationStub = stub().resolves(true)
const spaceCreateStub = stub().resolves(fakeSpace)

test.before(() => {
  createSpaceStepRewireApi.__Rewire__('confirmation', confirmationStub)
  createSpaceStepRewireApi.__Rewire__('spaceCreate', spaceCreateStub)
  createSpaceStepRewireApi.__Rewire__('wrappedLog', stub())
  createSpaceStepRewireApi.__Rewire__('log', stub())
})

test.afterEach(() => {
  confirmationStub.resetHistory()
  spaceCreateStub.resetHistory()
  guideContext.stepCount = 0
})

test.after.always(() => {
  createSpaceStepRewireApi.__ResetDependency__('confirmation')
  createSpaceStepRewireApi.__ResetDependency__('spaceCreate')
  createSpaceStepRewireApi.__ResetDependency__('wrappedLog')
  createSpaceStepRewireApi.__ResetDependency__('log')
})

test.serial('creates space on successful user confirmation', async (t) => {
  await createSpaceStep(guideContext)
  t.true(confirmationStub.calledOnce, 'confirmation called')
  t.true(spaceCreateStub.calledOnce, 'spaceCreate called')
  t.true(spaceCreateStub.calledWith({name: guideContext.activeGuide.name}), 'spaceCreate called with proper args')
})

test.serial('guideContext stepCount incremented', async (t) => {
  const stepCount = guideContext.stepCount
  await createSpaceStep(guideContext)
  t.is(guideContext.stepCount, stepCount + 1)
})

test('guideContext spaceId gets set after spaceCreation', async (t) => {
  await createSpaceStep(guideContext)
  t.is(guideContext.spaceId, fakeSpace.sys.id)
})

test.serial('throws AbortedError if user does not confirm', async (t) => {
  confirmationStub.resolves(false)
  await t.throws(createSpaceStep(guideContext), AbortedError)
  confirmationStub.resolves(true)
})
