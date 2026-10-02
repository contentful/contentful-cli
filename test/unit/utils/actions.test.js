const { PassThrough } = require('stream')
const {
  confirmation,
  prompt: promptHelper
} = require('../../../lib/utils/actions')
const { PreconditionFailedError } = require('../../../lib/utils/error')

const { prompt } = require('inquirer')

jest.mock('inquirer')

afterEach(() => {
  prompt.mockReset()
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

describe('prompt with a real readline', () => {
  const inquirer = jest.requireActual('inquirer')
  let input

  beforeEach(() => {
    input = new PassThrough()
    const output = new PassThrough()
    output.resume()
    prompt.mockImplementation(questions =>
      inquirer.createPromptModule({ input, output })(questions)
    )
  })

  const question = { type: 'confirm', name: 'ready', message: 'Ready?' }

  test('rejects with the hint when stdin is closed', async () => {
    const pending = promptHelper([question], {
      hint: 'Pass --yes to skip this confirmation.'
    })
    input.end()
    await expect(pending).rejects.toThrow(PreconditionFailedError)
    await expect(pending).rejects.toThrow(
      'Cannot prompt for input because stdin is closed.\nPass --yes to skip this confirmation.'
    )
  })

  test('falls back to a generic hint', async () => {
    const pending = promptHelper([question])
    input.end()
    await expect(pending).rejects.toThrow(
      'Run this command in an interactive terminal.'
    )
  })

  test('resolves an answer piped before stdin closes', async () => {
    const pending = promptHelper([question])
    input.end('n\n')
    await expect(pending).resolves.toEqual({ ready: false })
  })

  test('confirmation forwards the hint', async () => {
    const pending = confirmation('Sure?', { hint: 'Pass --yes.' })
    input.end()
    await expect(pending).rejects.toThrow('Pass --yes.')
  })

  test('removes the exit hook that would crash on the closed readline', async () => {
    const before = process.listenerCount('exit')
    const pending = promptHelper([question])
    expect(process.listenerCount('exit')).toBe(before + 1)
    input.end()
    await expect(pending).rejects.toThrow()
    expect(process.listenerCount('exit')).toBe(before)
  })
})
