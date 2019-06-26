import seedStep from '../../../lib/guide/step-seed'

import { AbortedError } from '../../../lib/guide/helpers'
import { confirmation } from '../../../lib/utils/actions'
import { getContext } from '../../../lib/context'
import { spaceSeed } from '../../../lib/cmds/space_cmds/seed'

jest.mock('../../../lib/utils/log')
jest.mock('../../../lib/utils/actions')
jest.mock('../../../lib/context')
jest.mock('../../../lib/cmds/space_cmds/seed')

getContext.mockResolvedValue({ cmaToken: 'cmaToken', activeEnvironmentId: 'master' })

const guideContext = {
  stepCount: 0,
  spaceId: 'abc124',
  activeGuide: {
    seed: 'test'
  }
}
confirmation.mockResolvedValue(true)

afterEach(() => {
  confirmation.mockClear()
  spaceSeed.mockClear()
  guideContext.stepCount = 0
})

test('seeds space on successful user confirmation', async () => {
  await seedStep(guideContext)
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(spaceSeed).toHaveBeenCalledTimes(1)
  const { activeGuide: {seed} } = guideContext
  expect(spaceSeed).toHaveBeenCalledWith({
    context: { cmaToken: 'cmaToken', activeEnvironmentId: 'master', activeSpaceId: guideContext.spaceId },
    template: seed,
    yes: true,
    feature: 'guide'
  })
})

test('guideContext stepCount incremented', async () => {
  const stepCount = guideContext.stepCount
  await seedStep(guideContext)
  expect(guideContext.stepCount).toBe(stepCount + 1)
})

test('throws AbortedError if user does not confirm', async () => {
  confirmation.mockResolvedValue(false)
  await expect(seedStep(guideContext)).rejects.toThrowError(AbortedError)
  confirmation.mockResolvedValue(true)
})
