import loginStep from '../../../lib/guide/step-login'
import { login } from '../../../lib/cmds/login'
import { getContext } from '../../../lib/context'

jest.mock('../../../lib/cmds/login')
jest.mock('../../../lib/context')
jest.mock('../../../lib/utils/log')

getContext.mockResolvedValue({ cmaToken: 'blah' })

afterEach(() => {
  login.mockClear()
  getContext.mockClear()
})

test('do not login if cmaToken already exists in context', async () => {
  await loginStep({})
  expect(getContext).toHaveBeenCalledTimes(1)
  expect(login).not.toHaveBeenCalled()
})

test(
  'login and increment stepCount if cmaToken does not exist in context',
  async () => {
    getContext.mockResolvedValue({})
    const stepCount = 0
    const guideContext = { stepCount }
    await loginStep(guideContext)
    expect(getContext).toHaveBeenCalledTimes(1)
    expect(login).toHaveBeenCalledTimes(1)
    expect(guideContext.stepCount).toBe(stepCount + 1)
  }
)
