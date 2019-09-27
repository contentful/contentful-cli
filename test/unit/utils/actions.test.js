const { confirmation } = require('../../../lib/utils/actions')

const { prompt } = require('inquirer')

jest.mock('inquirer')

afterEach(() => {
  prompt.mockClear()
})

test('confirmation continues after user accepted', async () => {
  prompt.mockResolvedValue({ ready: true })
  const confirmationResult = await confirmation()
  expect(prompt).toHaveBeenCalledTimes(1)
  expect(confirmationResult).toBe(true)
})

test('confirmation is asked again when user denies', async () => {
  prompt.mockResolvedValue({ ready: false })
  const confirmationResult = await confirmation()
  expect(prompt).toHaveBeenCalledTimes(1)
  expect(confirmationResult).toBe(false)
})
