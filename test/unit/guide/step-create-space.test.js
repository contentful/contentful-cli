import { AbortedError } from '../../../lib/guide/helpers'
import createSpaceStep from '../../../lib/guide/step-create-space'
import { confirmation } from '../../../lib/utils/actions'
import { spaceCreate } from '../../../lib/cmds/space_cmds/create'

jest.mock('../../../lib/utils/log')
jest.mock('../../../lib/utils/actions')
jest.mock('../../../lib/cmds/space_cmds/create')

const guideContext = {stepCount: 0, activeGuide: {name: 'test'}}
const fakeSpace = {sys: {id: '100abc'}}

confirmation.mockResolvedValue(true)
spaceCreate.mockResolvedValue(fakeSpace)

afterEach(() => {
  confirmation.mockClear()
  spaceCreate.mockClear()
  guideContext.stepCount = 0
})

test('creates space on successful user confirmation', async () => {
  await createSpaceStep(guideContext)
  expect(confirmation).toHaveBeenCalledTimes(1)
  expect(spaceCreate).toHaveBeenCalledTimes(1)
  expect(spaceCreate).toHaveBeenCalledWith({ name: guideContext.activeGuide.name, feature: 'guide' })
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
  confirmation.mockResolvedValueOnce(false)
  await expect(createSpaceStep(guideContext)).rejects.toThrowError(AbortedError)
})
