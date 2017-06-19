import test from 'ava'
import { stub } from 'sinon'

import {
  handle,
  __RewireAPI__ as spacePatchRewireAPI
} from '../../../../lib/cmds/space_cmds/patch'
import {
  setContext,
  emptyContext
} from '../../../../lib/context'

test.beforeEach((t) => {
  spacePatchRewireAPI.__Rewire__('assertLoggedIn', stub().returns(true))
  spacePatchRewireAPI.__Rewire__('assertSpaceIdProvided', stub().returns(true))
  emptyContext()
  setContext({
    activeSpaceId: 'foo',
    cmaToken: 'mockedToken'
  })
})

test.afterEach.always((t) => {
  spacePatchRewireAPI.__ResetDependency__('patchHandler')
  spacePatchRewireAPI.__ResetDependency__('EventSystem')
  spacePatchRewireAPI.__ResetDependency__('assertLoggedIn')
  spacePatchRewireAPI.__ResetDependency__('assertSpaceIdProvided')
  spacePatchRewireAPI.__ResetDependency__('readPatchDir')
})

test.serial('handler calls patchHander with correct args', async (t) => {
  spacePatchRewireAPI.__Rewire__('readPatchDir', () => Promise.resolve(['path1']))
  const patchhandlerStub = stub()
  spacePatchRewireAPI.__Rewire__('patchHandler', patchhandlerStub)
  const argv = {
    yes: true
  }

  await handle(argv)

  const expectedArgs = {
    spaceId: 'foo',
    accessToken: 'mockedToken',
    patchFilePaths: ['path1'],
    yes: true,
    dryRun: undefined
  }
  t.true(patchhandlerStub.calledWith(expectedArgs))
})

test.serial('handler does not call patchHandler when there are no patch files', async (t) => {
  spacePatchRewireAPI.__Rewire__('readPatchDir', () => Promise.resolve([]))
  const patchhandlerStub = stub()
  spacePatchRewireAPI.__Rewire__('patchHandler', patchhandlerStub)
  const dispatcherStub = stub()
  const eventSystemStub = function () {
    this.attachSubsystem = () => {}
    this.dispatcher = function () {
      return { error: dispatcherStub }
    }
  }
  spacePatchRewireAPI.__Rewire__('EventSystem', eventSystemStub)

  await handle({})

  t.true(dispatcherStub.calledWith('MISSING_PATCH_FILES'))
  t.false(patchhandlerStub.called)
})
