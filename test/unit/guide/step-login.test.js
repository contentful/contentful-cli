const loginStep = require('../../../lib/guide/step-login')
const { login } = require('../../../lib/cmds/login')
const { getContext } = require('../../../lib/context')

jest.mock('../../../lib/cmds/login')
jest.mock('../../../lib/context')
jest.mock('../../../lib/utils/log')

getContext.mockResolvedValue({ managementToken: 'blah' })

afterEach(() => {
  login.mockClear()
  getContext.mockClear()
})

test('do not login if managementToken already exists in context', async () => {
  await loginStep({})
  expect(getContext).toHaveBeenCalledTimes(1)
  expect(login).not.toHaveBeenCalled()
})

test('login and increment stepCount if managementToken does not exist in context', async () => {
  getContext.mockResolvedValue({})
  const stepCount = 0
  const guideContext = { stepCount }
  await loginStep(guideContext)
  expect(getContext).toHaveBeenCalledTimes(1)
  expect(login).toHaveBeenCalledTimes(1)
  expect(guideContext.stepCount).toBe(stepCount + 1)
})
