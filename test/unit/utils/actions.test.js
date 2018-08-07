import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  confirmation,
  __RewireAPI__ as actionsRewireAPI
} from '../../../lib/utils/actions'

const promptStub = stub(inquirer, 'prompt')

beforeAll(() => {
  actionsRewireAPI.__Rewire__('inquirer', inquirer)
})

afterAll(() => {
  actionsRewireAPI.__ResetDependency__('inquirer')
})

afterEach(() => {
  promptStub.reset()
})

test('confirmation continues after user accepted', async () => {
  promptStub.onCall(0).resolves({ ready: true })
  const confirmationResult = await confirmation()
  expect(promptStub.callCount).toBe(1)
  expect(confirmationResult).toBe(true)
})

test('confirmation is asked again when user denies', async () => {
  promptStub.onCall(0).resolves({ ready: false })
  const confirmationResult = await confirmation()
  expect(promptStub.callCount).toBe(1)
  expect(confirmationResult).toBe(false)
})
