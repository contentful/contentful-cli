import { stub } from 'sinon'
import { AbortedError } from '../../../lib/guide/helpers'
import seedStep,
{ __RewireAPI__ as seedStepRewireApi} from '../../../lib/guide/step-seed'

const guideContext = {
  stepCount: 0,
  spaceId: 'abc124',
  activeGuide: {
    seed: 'test'
  }
}
const confirmationStub = stub().resolves(true)
const spaceSeedStub = stub().resolves()

beforeAll(() => {
  seedStepRewireApi.__Rewire__('log', stub())
  seedStepRewireApi.__Rewire__('wrappedLog', stub())
  seedStepRewireApi.__Rewire__('confirmation', confirmationStub)
  seedStepRewireApi.__Rewire__('spaceSeed', spaceSeedStub)
})

afterEach(() => {
  confirmationStub.resetHistory()
  guideContext.stepCount = 0
})

afterAll(() => {
  seedStepRewireApi.__ResetDependency__('log')
  seedStepRewireApi.__ResetDependency__('wrappedLog')
  seedStepRewireApi.__ResetDependency__('confirmation')
  seedStepRewireApi.__ResetDependency__('spaceSeed')
})

test('seeds space on successful user confirmation', async () => {
  await seedStep(guideContext)
  expect(confirmationStub.calledOnce).toBe(true)
  expect(spaceSeedStub.calledOnce).toBe(true)
  const { spaceId, activeGuide: {seed} } = guideContext
  expect(spaceSeedStub.calledWith({
    template: seed,
    spaceId,
    yes: true,
    feature: 'guide'
  })).toBe(true)
})

test('guideContext stepCount incremented', async () => {
  const stepCount = guideContext.stepCount
  await seedStep(guideContext)
  expect(guideContext.stepCount).toBe(stepCount + 1)
})

test('throws AbortedError if user does not confirm', async () => {
  confirmationStub.resolves(false)
  await expect(seedStep(guideContext)).toThrowError(AbortedError)
  confirmationStub.resolves(true)
})
