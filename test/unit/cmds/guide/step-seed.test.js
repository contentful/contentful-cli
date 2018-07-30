import test from 'ava'
import { stub } from 'sinon'
import { AbortedError } from '../../../../lib/cmds/guide/helpers'
import seedStep,
{ __RewireAPI__ as seedStepRewireApi} from '../../../../lib/cmds/guide/step-seed'

const guideContext = {
  stepCount: 0,
  spaceId: 'abc124',
  activeGuide: {
    seed: 'test'
  }
}
const confirmationStub = stub().resolves(true)
const spaceSeedStub = stub().resolves()

test.before(() => {
  seedStepRewireApi.__Rewire__('log', stub())
  seedStepRewireApi.__Rewire__('wrappedLog', stub())
  seedStepRewireApi.__Rewire__('confirmation', confirmationStub)
  seedStepRewireApi.__Rewire__('spaceSeed', spaceSeedStub)
})

test.afterEach(() => {
  confirmationStub.resetHistory()
  guideContext.stepCount = 0
})

test.after.always(() => {
  seedStepRewireApi.__ResetDependency__('log')
  seedStepRewireApi.__ResetDependency__('wrappedLog')
  seedStepRewireApi.__ResetDependency__('confirmation')
  seedStepRewireApi.__ResetDependency__('spaceSeed')
})

test.serial('seeds space on successful user confirmation', async (t) => {
  await seedStep(guideContext)
  t.true(confirmationStub.calledOnce, 'confirmation called')
  t.true(spaceSeedStub.calledOnce, 'spaceSeed called')
  const { spaceId, activeGuide: {seed} } = guideContext
  t.true(spaceSeedStub.calledWith({
    template: seed,
    spaceId,
    yes: true
  }), 'spaceSeed called with proper args')
})

test.serial('guideContext stepCount incremented', async (t) => {
  const stepCount = guideContext.stepCount
  await seedStep(guideContext)
  t.is(guideContext.stepCount, stepCount + 1)
})

test.serial('throws AbortedError if user does not confirm', async (t) => {
  confirmationStub.resolves(false)
  await t.throws(seedStep(guideContext), AbortedError)
  confirmationStub.resolves(true)
})
