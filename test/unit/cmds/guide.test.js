import { stub } from 'sinon'

import {
  guide,
  __RewireAPI__ as guideRewireApi
} from '../../../lib/cmds/guide'
import { AbortedError } from '../../../lib/guide/helpers'

const loginStepStub = stub().returns(Promise.resolve())
const createSpaceStepStub = stub().returns(Promise.resolve())
const seedStepStub = stub().returns(Promise.resolve())
const setupStepStub = stub().returns(Promise.resolve())
const devServerStepStub = stub().returns(Promise.resolve())
const finishStepStub = stub().returns(Promise.resolve())

const steps = ['loginStep', 'createSpaceStep', 'seedStep', 'setupStep', 'devServerStep', 'finishStep']
const stubs = [loginStepStub, createSpaceStepStub, seedStepStub, setupStepStub, devServerStepStub, finishStepStub]
const randomError = new Error('random error')
beforeAll(() => {
  guideRewireApi.__Rewire__('loginStep', loginStepStub)
  guideRewireApi.__Rewire__('createSpaceStep', createSpaceStepStub)
  guideRewireApi.__Rewire__('seedStep', seedStepStub)
  guideRewireApi.__Rewire__('setupStep', setupStepStub)
  guideRewireApi.__Rewire__('devServerStep', devServerStepStub)
  guideRewireApi.__Rewire__('finishStep', finishStepStub)
  guideRewireApi.__Rewire__('log', stub())
})

afterEach(() => {
  stubs.map((stub) => stub.resetHistory())
})

afterAll(() => {
  steps.map((step) => {
    guideRewireApi.__ResetDependency__(step)
  })
  guideRewireApi.__ResetDependency__('log')
})

test('guide cmd calls every step', async () => {
  await guide()
  stubs.map((stub) => {
    expect(stub.calledOnce).toBe(true)
    expect(stub.getCall(0).args[0].activeGuide).toBeTruthy()
  })
})

test('handles errors correctly in loginStep', async () => {
  loginStepStub.rejects(new AbortedError())
  await expect(guide).not.toThrow()
  loginStepStub.rejects(randomError)
  await expect(guide()).rejects.toThrow()
  loginStepStub.resolves()
})

test('handles errors correctly in createSpaceStep', async () => {
  createSpaceStepStub.rejects(new AbortedError())
  await expect(guide).not.toThrow()
  createSpaceStepStub.rejects(randomError)
  try {
    await expect(guide()).rejects.toThrow()
  } catch (e) {}
  createSpaceStepStub.resolves()
})

test('handles errors correctly in seedStep', async () => {
  seedStepStub.rejects(new AbortedError())
  await expect(guide).not.toThrow()
  seedStepStub.rejects(randomError)
  try {
    await expect(guide()).rejects.toThrow()
  } catch (e) {}
  seedStepStub.resolves()
})

test('handles errors correctly in setupStep', async () => {
  setupStepStub.rejects(new AbortedError())
  await expect(guide).not.toThrow()
  setupStepStub.rejects(randomError)
  try {
    await expect(guide()).rejects.toThrow()
  } catch (e) {}
  setupStepStub.resolves()
})

test('handles errors correctly in devServerStep', async () => {
  devServerStepStub.rejects(new AbortedError())
  expect(await guide()).resolves
  expect(finishStepStub.calledOnce).toBe(true)
  finishStepStub.resetHistory()
  devServerStepStub.rejects(randomError)
  try {
    await expect(guide()).rejects.toThrow()
  } catch (e) {}
  expect(finishStepStub.calledOnce).toBeFalsy()
  devServerStepStub.resolves()
})
