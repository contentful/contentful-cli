import test from 'ava'
import sinon from 'sinon'
import Bluebird from 'bluebird'

import { successEmoji } from '../../../../lib/utils/emojis'
import patchHandler, {
  publishPatchResults,
  __RewireAPI__ as publishRewire
} from '../../../../lib/core/patch/patch-files-handler'
import stubContentType from '../../cmds/content-type_cmds/stubs/_content-type'

import { EventSystem } from '../../../../lib/core/events'
import { PATCH_FILE_HANDLER } from '../../../../lib/core/events/scopes'
import IntentSystem from '../../../../lib/core/event-handlers/intents'
import LoggingSystem from '../../../../lib/core/event-handlers/logging'
import patchFileLogging from '../../../../lib/core/event-handlers/logging/patch-file-handler'

const loggingStubs = () => ({ log: sinon.spy(), error: sinon.spy() })

const clientGenerator = (returnValue) => () => {
  return Promise.resolve({
    getSpace: sinon.stub().returns(returnValue)
  })
}

const createEventSystem = (logging, confirm = true) => {
  const eventSystem = new EventSystem()
  const intentSystem = new IntentSystem()
  const loggingSystem = new LoggingSystem(logging)

  intentSystem.addHandler({
    scopes: [PATCH_FILE_HANDLER],
    intents: {
      'CONFIRM_CONTENT_TYPE_PUBLISH': async () => {
        return confirm
      }
    }
  })

  loggingSystem.addHandler(patchFileLogging)

  eventSystem.attachSubsystem(intentSystem)
  eventSystem.attachSubsystem(loggingSystem)

  return eventSystem
}

test('it applies the patch files', async function (t) {
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve('test content type'))
  }
  const createContentfulClient = clientGenerator(spaceStub)
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
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, eventSystem)

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

  t.true(logging.log.calledWith('Patch File: "a"\nContent Type: "123"'))
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
  const createContentfulClient = clientGenerator(spaceStub)
  const logging = loggingStubs()
  const eventSystem = createEventSystem(logging)

  await t.notThrows(patchHandler(args, createContentfulClient, function () {}, helpers, eventSystem))
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
  const createContentfulClient = clientGenerator(spaceStub)
  const logging = loggingStubs()
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, function () {}, helpers, eventSystem)

  t.true(logging.log.called)
  t.true(logging.log.calledWith('Content Type "foo" doesn\'t exist or has already been deleted'))
})

test('it sets the migration header on the Contentful Client', async function (t) {
  const args = { accessToken: 'very-token', patchFilePaths: [] }
  const helpers = {}
  const createContentfulClient = sinon.stub().returns(Bluebird.resolve({ getSpace: sinon.stub().returns(Bluebird.resolve) }))
  const logging = loggingStubs()
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, function () {}, helpers, eventSystem)

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
  const createContentfulClient = clientGenerator(spaceStub)
  const logging = loggingStubs()
  const patchApplier = sinon.stub().returns({})
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, patchApplier, helpers, eventSystem)
  t.true(patchApplier.calledWith(patchFileContents, contentType, helpers, eventSystem))
})

test('it ignores nested directories', async function (t) {
  const spaceStub = {
    getContentType: sinon.stub().returns(Bluebird.resolve('test content type'))
  }
  const createContentfulClient = clientGenerator(spaceStub)
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
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, eventSystem)

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
  const createContentfulClient = clientGenerator(spaceStub)
  const args = {
    patchFilePaths: Object.keys(patches),
    dryRun: false
  }
  const logging = loggingStubs()
  const applyPatchesSpy = sinon.stub().returns({patched: true})
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, eventSystem)

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
  const createContentfulClient = clientGenerator(spaceStub)
  const args = {
    patchFilePaths: Object.keys(patches),
    dryRun: false
  }
  const logging = loggingStubs()
  const applyPatchesSpy = sinon.stub().returns({patched: false})
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, eventSystem)

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
  const createContentfulClient = clientGenerator(spaceStub)
  const args = {
    patchFilePaths: Object.keys(patches),
    dryRun: true
  }
  const publishStub = sinon.stub()
  const logging = loggingStubs()
  const applyPatchesSpy = sinon.stub().returns({patched: false})
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, eventSystem)

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
  const createContentfulClient = clientGenerator(spaceStub)
  const args = {
    patchFilePaths: Object.keys(patches),
    dryRun: false
  }
  const logging = loggingStubs()
  const applyPatchesSpy = sinon.stub().returns({patched: false})
  const eventSystem = createEventSystem(logging)

  await patchHandler(args, createContentfulClient, applyPatchesSpy, helpers, eventSystem)

  t.true(publishStub.called)
})

test('publishes changes when user wants', async function (t) {
  const patchResults = [
    { patched: true, contentType: 'first' },
    { patched: true, contentType: 'second' }
  ]

  const logging = loggingStubs()
  const maybePublishContentType = sinon.stub().returns(Promise.resolve())
  const eventSystem = createEventSystem(logging)

  await publishPatchResults(patchResults, maybePublishContentType, eventSystem.dispatcher(PATCH_FILE_HANDLER))

  t.is(maybePublishContentType.callCount, 2)
  t.true(maybePublishContentType.calledWith('first'))
  t.true(maybePublishContentType.calledWith('second'))

  t.true(logging.log.called)
  t.true(logging.log.calledWith(`${successEmoji} Content types published`))
})

test('does not publish changes when user does not confirm,', async function (t) {
  const patchResults = [
    { patched: true, contentType: 'first' },
    { patched: true, contentType: 'second' }
  ]

  const logging = loggingStubs()
  const maybePublishContentType = sinon.stub().returns(Promise.resolve())
  const eventSystem = createEventSystem(logging, false)

  await publishPatchResults(patchResults, maybePublishContentType, eventSystem.dispatcher(PATCH_FILE_HANDLER))

  t.false(maybePublishContentType.called)

  t.true(logging.log.called)
  t.true(logging.log.calledWith('Your content types have been saved as drafts, not published.'))
})

test('does ask for publish confirmation when user did not provide skip option', async function (t) {
  const patchResults = [
    { patched: true, contentType: 'first' },
    { patched: true, contentType: 'second' }
  ]

  const logging = loggingStubs()
  const maybePublishContentType = sinon.stub().returns(Promise.resolve())
  const eventSystem = createEventSystem(logging)

  await publishPatchResults(patchResults, maybePublishContentType, eventSystem.dispatcher(PATCH_FILE_HANDLER))

  t.true(maybePublishContentType.called)
})

test('does nothing when there were no changes', async function (t) {
  const patchResults = [
    { patched: false, contentType: 'first' },
    { patched: false, contentType: 'second' }
  ]

  const logging = loggingStubs()
  const maybePublishContentType = sinon.stub().returns(Promise.resolve())
  const eventSystem = createEventSystem(logging)

  await publishPatchResults(patchResults, maybePublishContentType, eventSystem.dispatcher(PATCH_FILE_HANDLER))

  t.false(maybePublishContentType.called)
  t.false(logging.log.called)
})
