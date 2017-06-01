import test from 'ava'
import sinon from 'sinon'
import Bluebird from 'bluebird'

import { successEmoji } from '../../../../lib/utils/emojis'
import patchHandler, {
  publishPatchResults,
  __RewireAPI__ as publishRewire
} from '../../../../lib/cmds/space_cmds/patch-handler'
import stubContentType from '../content-type_cmds/stubs/_content-type'

const loggingStubs = () => ({ log: sinon.spy(), error: sinon.spy() })

test('it applies the patch files', async function (t) {
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve('test content type'))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const patches = {
    'path/a': {id: '123', action: 'patch', patches: ['beep', 'boop']},
    'path/b': {id: '123', action: 'patch', patches: [{op: 'add', path: '/name', value: 'hello there'}]}
  }
  const helpers = {
    readPatchFile: (path) => patches[path]
  }
  const applyPatchesSpy = sinon.stub().returns({})
  const args = {
    patchFilePaths: Object.keys(patches)
  }
  const logging = loggingStubs()

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, logging)

  t.is(applyPatchesSpy.callCount, 2)
  t.true(applyPatchesSpy.calledWith(
    patches['path/a'],
    'test content type',
    helpers)
  )
  t.true(applyPatchesSpy.calledWith(
    patches['path/b'],
    'test content type',
    helpers)
  )

  t.true(logging.log.calledWith('Patch File: "a"'))
  t.true(logging.log.calledWith('Content Type: "123"'))
})

test('it does not crash when applying a patch to delete a deleted Content Type', async function (t) {
  const args = {
    patchFilePaths: ['fake-file.json']
  }
  const helpers = {
    readPatchFile: () => ({ id: 'foo', action: 'delete', patches: [] })
  }
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.reject({name: 'NotFound'}))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const logging = loggingStubs()

  await t.notThrows(patchHandler(args, createContentfulClient, function () {}, helpers, logging))
})

test('it logs when can not deleted non existing Content Type', async function (t) {
  const args = {
    patchFilePaths: ['fake-file.json']
  }
  const helpers = {
    readPatchFile: () => ({ id: 'foo', action: 'delete', patches: [] })
  }
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.reject({name: 'NotFound'}))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const logging = loggingStubs()

  await patchHandler(args, createContentfulClient, function () {}, helpers, logging)

  t.true(logging.log.called)
  t.true(logging.log.calledWith('Content Type "foo" doesn\'t exist or has already been deleted'))
})

test('it sets the migration header on the Contentful Client', async function (t) {
  const args = { accessToken: 'very-token', patchFilePaths: [] }
  const helpers = {}
  const createContentfulClient = sinon.stub().returns({ getSpace: sinon.stub().returns(Bluebird.resolve) })
  const logging = loggingStubs()

  await patchHandler(args, createContentfulClient, function () {}, helpers, logging)

  t.true(createContentfulClient.calledWith({
    accessToken: args.accessToken,
    headers: {
      'X-Contentful-Beta-Content-Type-Migration': true
    }
  }))
})

test('it passes the right arguments to the patch applier', async function (t) {
  const args = {
    patchFilePaths: ['fake-file.json']
  }
  const patchFileContents = { id: 'foo', action: 'delete', patches: [] }
  const helpers = { readPatchFile: () => patchFileContents }
  const contentType = stubContentType()
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve(contentType))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const logging = loggingStubs()
  const patchApplier = sinon.stub().returns({})

  await patchHandler(args, createContentfulClient, patchApplier, helpers, logging)

  t.true(patchApplier.calledWith(patchFileContents, contentType, helpers, logging))
})

test('it ignores nested directories', async function (t) {
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve('test content type'))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const patches = {
    'path/dir': {},
    'path/b': {id: '123', action: 'patch', patches: [{op: 'add', path: '/name', value: 'hello there'}]}
  }
  const helpers = {
    readPatchFile: (path) => {
      if (path === 'path/dir') {
        let err = new Error()
        err.code = 'EISDIR'
        throw err
      }
      return patches[path]
    }
  }
  const applyPatchesSpy = sinon.stub().returns({})
  const args = {
    patchFilePaths: Object.keys(patches)
  }
  const logging = loggingStubs()

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, logging)

  t.is(applyPatchesSpy.callCount, 1)
  t.true(applyPatchesSpy.calledWith(
    patches['path/b'],
    'test content type',
    helpers)
  )
  t.is(logging.error.callCount, 1)
})

test('it logs if the patches changed the Content Type', async function (t) {
  const patches = {
    'path/a': {id: '123', action: 'patch', patches: ['beep', 'boop']},
    'path/b': {id: '123', action: 'patch', patches: [{op: 'add', path: '/name', value: 'hello there'}]}
  }
  const helpers = {
    readPatchFile: (path) => patches[path],
    confirm: sinon.stub()
  }
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve('test content type'))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const args = {
    patchFilePaths: Object.keys(patches),
    dryRun: false
  }
  const logging = loggingStubs()
  const applyPatchesSpy = sinon.stub().returns({patched: true})

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, logging)

  t.true(logging.log.called)
  t.true(logging.log.calledWith(`${successEmoji} Patches applied`))
})

test('it logs if the patches did not change the Content Type', async function (t) {
  const patches = {
    'path/a': {id: '123', action: 'patch', patches: ['beep', 'boop']},
    'path/b': {id: '123', action: 'patch', patches: [{op: 'add', path: '/name', value: 'hello there'}]}
  }
  const helpers = {
    readPatchFile: (path) => patches[path],
    confirm: sinon.stub()
  }
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve({name: 'test content type'}))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const args = {
    patchFilePaths: Object.keys(patches),
    dryRun: false
  }
  const logging = loggingStubs()
  const applyPatchesSpy = sinon.stub().returns({patched: false})

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, logging)

  t.true(logging.log.called)
  t.true(logging.log.calledWith('No changes for content type "test content type"'))
})

test('it does not log or publish  anything when --dry-run', async function (t) {
  const patches = {
    'path/a': {id: '123', action: 'patch', patches: ['beep', 'boop']},
    'path/b': {id: '123', action: 'patch', patches: [{op: 'add', path: '/name', value: 'hello there'}]}
  }
  const helpers = {
    readPatchFile: (path) => patches[path]
  }
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve('test content type'))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const args = {
    patchFilePaths: Object.keys(patches),
    dryRun: true
  }
  const publishStub = sinon.stub()
  const logging = loggingStubs()
  const applyPatchesSpy = sinon.stub().returns({patched: false})

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, logging)

  t.true(logging.log.called)
  t.false(logging.log.calledWith('No changes for Content Type "CT"'))
  t.false(logging.log.calledWith(`${successEmoji} Patches applied`))
  t.false(publishStub.called)
})

test('publishes patch results in the end', async function (t) {
  const publishStub = sinon.stub()
  publishRewire.__Rewire__('publishPatchResults', publishStub)
  const patches = {
    'path/a': {id: '123', action: 'patch', patches: ['beep', 'boop']},
    'path/b': {id: '123', action: 'patch', patches: [{op: 'add', path: '/name', value: 'hello there'}]}
  }
  const helpers = {
    readPatchFile: (path) => patches[path]
  }
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve('test content type'))
  }
  const createContentfulClient = () => {
    return {
      getSpace: sinon.stub().returns(spaceStub)
    }
  }
  const args = {
    patchFilePaths: Object.keys(patches),
    dryRun: false
  }
  const logging = loggingStubs()
  const applyPatchesSpy = sinon.stub().returns({patched: false})

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, logging)

  t.true(publishStub.called)
})

test('publishes changes when user wants', async function (t) {
  const patchResults = [
    { patched: true, contentType: 'first' },
    { patched: true, contentType: 'second' }
  ]
  const helpers = {
    confirm: sinon.stub().returns(true)
  }
  const logging = loggingStubs()
  const maybePublishContentType = sinon.stub().returns(Promise.resolve())

  await publishPatchResults(patchResults, maybePublishContentType, helpers, logging)

  t.is(maybePublishContentType.callCount, 2)
  t.true(maybePublishContentType.calledWith('first'))
  t.true(maybePublishContentType.calledWith('second'))

  t.true(logging.log.called)
  t.true(logging.log.calledWith(`${successEmoji} Patches published`))
})

test('does not publish changes when user does not confirm,', async function (t) {
  const patchResults = [
    { patched: true, contentType: 'first' },
    { patched: true, contentType: 'second' }
  ]
  const helpers = {
    confirm: sinon.stub().returns(false)
  }
  const logging = loggingStubs()
  const maybePublishContentType = sinon.stub().returns(Promise.resolve())

  await publishPatchResults(patchResults, maybePublishContentType, helpers, logging)

  t.false(maybePublishContentType.called)

  t.true(logging.log.called)
  t.true(logging.log.calledWith('Your patches have been applied as drafts, not published.'))
})

test('does nothing when there were no changes', async function (t) {
  const patchResults = [
    { patched: false, contentType: 'first' },
    { patched: false, contentType: 'second' }
  ]
  const helpers = {
    confirm: sinon.stub().returns(true)
  }
  const logging = loggingStubs()
  const maybePublishContentType = sinon.stub().returns(Promise.resolve())

  await publishPatchResults(patchResults, maybePublishContentType, helpers, logging)

  t.false(maybePublishContentType.called)
  t.false(logging.log.called)
})
