import test from 'ava'
import { stub } from 'sinon'
import devServerStep,
{ __RewireAPI__ as devServerStepRewireApi } from '../../../../lib/cmds/guide/step-dev-server'
import { AbortedError } from '../../../../lib/cmds/guide/helpers'

const guideContext = {
  stepCount: 0,
  spaceId: 'abc124',
  installationDirectory: '/my/directory',
  activeGuide: {
    seed: 'test',
    devParameters: ['param1', 'param2']
  }
}

const treeKillStub = stub()
const confirmationStub = stub().resolves(true)
const stdoutStub = {
  pipe: stub(),
  removeListener: stub(),
  on: stub().yields() // pass some arg here prob
}
const execaStub = stub().returns({
  stdout: stdoutStub,
  pid: '1'
})

const processStub = {
  stdin: {
    resume: stub(),
    setEncoding: stub(),
    setRawMode: stub(),
    on: stub().yields('q'),
    removeListener: stub(),
    pause: stub()
  }
}

test.before(() => {
  devServerStepRewireApi.__Rewire__('log', stub())
  devServerStepRewireApi.__Rewire__('wrappedLog', stub())
  devServerStepRewireApi.__Rewire__('confirmation', confirmationStub)
  devServerStepRewireApi.__Rewire__('execa', execaStub)
  devServerStepRewireApi.__Rewire__('treeKill', treeKillStub)
})

test.afterEach(() => {
  guideContext.stepCount = 0
})

test.after.always(() => {
  devServerStepRewireApi.__ResetDependency__('log')
  devServerStepRewireApi.__ResetDependency__('wrappedLog')
  devServerStepRewireApi.__ResetDependency__('confirmation')
  devServerStepRewireApi.__ResetDependency__('execa')
  devServerStepRewireApi.__ResetDependency__('treeKill')
  devServerStepRewireApi.__ResetDependency__(process)
})

test.serial('throws AbortedError if user does not confirm', async (t) => {
  confirmationStub.resolves(false)
  await t.throws(devServerStep(guideContext), AbortedError)
  confirmationStub.resolves(true)
})

test.serial.skip('calls execa and process.stdin start cmds', async (t) => {
  await devServerStep(guideContext)
  t.true(execaStub.calledOnce, 'execa called')
  const stdin = processStub.stdin
  t.true(stdin.resume.calledOnce, 'process.stdin.resume called')
  t.true(stdin.setEncoding.calledOnce, 'process.stdin.setEncoding called')
  t.true(stdin.setRawMode.calledTwice, 'process.stdin.setRawMode called')
  t.true(stdin.setRawMode.args[0][0], 'process.stdin.setRawMode called with true first time')
  t.false(stdin.setRawMode.args[1][0], 'process.stdin.setRawMode called with false second time')
})
