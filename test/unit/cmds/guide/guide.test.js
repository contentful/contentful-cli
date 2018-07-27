import test from 'ava'
import { stub } from 'sinon'

import {
  guide,
  __RewireAPI__ as guideRewireApi
} from '../../../../lib/cmds/guide'
import { AbortedError } from '../../../../lib/cmds/guide/helpers'

const loginStepStub = stub().returns(Promise.resolve())
const createSpaceStepStub = stub().returns(Promise.resolve())
const seedStepStub = stub().returns(Promise.resolve())
const setupStepStub = stub().returns(Promise.resolve())
const devServerStepStub = stub().returns(Promise.resolve())
const finishStepStub = stub().returns(Promise.resolve())

const steps = ['loginStep', 'createSpaceStep', 'seedStep', 'setupStep', 'devServerStep', 'finishStep']
const stubs = [loginStepStub, createSpaceStepStub, seedStepStub, setupStepStub, devServerStepStub, finishStepStub]
const randomError = new Error('random error')
test.before(() => {
  guideRewireApi.__Rewire__('loginStep', loginStepStub)
  guideRewireApi.__Rewire__('createSpaceStep', createSpaceStepStub)
  guideRewireApi.__Rewire__('seedStep', seedStepStub)
  guideRewireApi.__Rewire__('setupStep', setupStepStub)
  guideRewireApi.__Rewire__('devServerStep', devServerStepStub)
  guideRewireApi.__Rewire__('finishStep', finishStepStub)
  guideRewireApi.__Rewire__('log', stub())
})

test.afterEach.always(() => {
  stubs.map((stub) => stub.resetHistory())
})

test.after(() => {
  steps.map((step) => {
    guideRewireApi.__ResetDependency__(step)
  })
  guideRewireApi.__ResetDependency__('log')
})

test.serial('guide cmd calls every step', async (t) => {
  await guide()
  stubs.map((stub) => {
    t.true(stub.calledOnce, `${stub} was called once`)
    t.truthy(stub.getCall(0).args[0].activeGuide, `${stub} called with guideContext with activeGuide key`)
  })
})

test.serial('handles errors correctly in loginStep', async (t) => {
  loginStepStub.rejects(new AbortedError())
  await t.notThrows(guide())
  loginStepStub.rejects(randomError)
  await t.throws(guide())
  loginStepStub.resolves()
})

test.serial('handles errors correctly in createSpaceStep', async (t) => {
  createSpaceStepStub.rejects(new AbortedError())
  await t.notThrows(guide())
  createSpaceStepStub.rejects(randomError)
  await t.throws(guide())
  createSpaceStepStub.resolves()
})

test.serial('handles errors correctly in seedStep', async (t) => {
  seedStepStub.rejects(new AbortedError())
  await t.notThrows(guide())
  seedStepStub.rejects(randomError)
  await t.throws(guide())
  seedStepStub.resolves()
})

test.serial('handles errors correctly in setupStep', async (t) => {
  setupStepStub.rejects(new AbortedError())
  await t.notThrows(guide())
  setupStepStub.rejects(randomError)
  await t.throws(guide())
  setupStepStub.resolves()
})

test.serial('handles errors correctly in devServerStep', async (t) => {
  devServerStepStub.rejects(new AbortedError())
  await t.notThrows(guide())
  t.true(finishStepStub.calledOnce, 'finish step still called after devServerStep aborted by user')
  finishStepStub.resetHistory()
  devServerStepStub.rejects(randomError)
  await t.throws(guide())
  t.falsy(finishStepStub.calledOnce, 'finish step not called after devServerStep aborted with random error')
  devServerStepStub.resolves()
})
