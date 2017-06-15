import test from 'ava'
import Bluebird from 'bluebird'
import sinon from 'sinon'

import ContentTypeProxy from '../../../../lib/cmds/content-type_cmds/utils/content-type-proxy'
import makePatchHooks from '../../../../lib/core/patch/make-patch-hooks'

import { EventSystem } from '../../../../lib/core/events'
import { PATCH_HOOKS } from '../../../../lib/core/events/scopes'
import IntentSystem from '../../../../lib/core/event-handlers/intents'

import stubContentType from '../../cmds/content-type_cmds/stubs/_content-type'
import stubHelpers from '../../cmds/content-type_cmds/stubs/_helpers'

const createEventSystem = (confirmDelete = true, confirmPatch = true) => {
  const eventSystem = new EventSystem()
  const intentSystem = new IntentSystem()

  intentSystem.addHandler({
    scopes: [PATCH_HOOKS],
    intents: {
      'CONFIRM_CONTENT_TYPE_DELETE': async ({ contentType }) => {
        return confirmDelete
      },
      'CONFIRM_CONTENT_TYPE_PATCH': async () => {
        return confirmPatch
      }
    }
  })

  eventSystem.attachSubsystem(intentSystem)

  return eventSystem
}

test('saves the Content Type after the patches have been applied', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/required', value: true },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  contentType.update = function () {
    t.true(this.fields[0].required)
    t.is(this.name, 'New CT')

    return Bluebird.resolve(this)
  }

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)
})

test('indicates when patches were applied', async function (t) {
  const helpers = stubHelpers()
  helpers.hasChanged = sinon.stub().returns(true)
  const patches = [
    { op: 'add', path: '/fields/0/required', value: true },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  let result = await makePatchHooks(patchSet, contentType, helpers, eventSystem)
  t.is(result.patched, true)
})

test('indicates when no patches were applied', async function (t) {
  const helpers = stubHelpers()
  helpers.hasChanged = sinon.stub().returns(false)
  const patches = [
    { op: 'add', path: '/fields/0/required', value: true },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  let result = await makePatchHooks(patchSet, contentType, helpers, eventSystem)
  t.is(result.patched, false)
})

test('saves the Content Type right after a field is omitted', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'add', path: '/description', value: 'Shinny' },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  contentType.update = sinon.stub()
  contentType.update.onFirstCall().callsFake(function () {
    t.true(this.fields[0].omitted)
    t.is(this.name, 'CT')
    t.is(this.description, undefined)

    return Bluebird.resolve(this)
  })
  contentType.update.onSecondCall().callsFake(function () {
    t.is(this.name, 'New CT')
    t.is(this.description, 'Shinny')

    return Bluebird.resolve(this)
  })

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)
})

test('on dry run does not save the Content Type', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'add', path: '/description', value: 'Shinny' },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()
  const options = { dryRun: true }

  contentType.update = sinon.spy()

  await makePatchHooks(patchSet, contentType, helpers, eventSystem, options)

  t.false(contentType.update.called)
})

test('throws when a patch is rejected', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'add', path: '/description', value: 'Shinny' },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const eventSystem = createEventSystem(true, false)

  await t.throws(makePatchHooks(patchSet, contentType, helpers, eventSystem), /Patch application has been aborted/)
})

test('deletes the Content Type when the resulting payload is an empty object', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'remove', path: '/fields' },
    { op: 'remove', path: '/name' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()
  contentType.delete = sinon.stub().returns(Bluebird.resolve())

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.true(contentType.delete.called)
  t.is(contentType.delete.callCount, 1)
})

test('waits until the Content Type is updated', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'replace', path: '/name', value: 'lol' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()
  let resolved = false
  const promise = Bluebird.delay(500).then(function () { resolved = true; return contentType })
  contentType.update = sinon.stub().returns(promise)

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.true(resolved)
})

test('waits until the Content Type is deleted', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'remove', path: '/fields' },
    { op: 'remove', path: '/name' }
  ]
  const patchSet = { action: 'patch', patches }

  const contentType = stubContentType()
  const eventSystem = createEventSystem()
  let resolved = false
  const promise = Bluebird.delay(500).then(function () { resolved = true; return contentType })
  contentType.delete = sinon.stub().returns(promise)

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.true(resolved)
})

test('waits until the Content Type is published', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true }
  ]
  const patchSet = { action: 'patch', patches }

  // omiting a field forces a publish

  const contentType = stubContentType()
  const eventSystem = createEventSystem()
  let resolved = false
  const promise = Bluebird.delay(500).then(function () { resolved = true; return contentType })
  contentType.publish = sinon.stub().returns(promise)

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.true(resolved)
})

test('does not return until the Content Type has been updated', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }

  // This patches don't require any additional update beside the one at the end
  // of the process

  const contentType = stubContentType()
  const eventSystem = createEventSystem()
  const promise = Bluebird.delay(500).return(contentType)
  contentType.update = sinon.stub().returns(promise)

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.true(promise.isFulfilled())
})

test('deletes the Content Type when the action is "delete"', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  contentType.isPublished = () => false
  contentType.update = sinon.spy()
  contentType.delete = sinon.spy()
  contentType.unpublish = sinon.spy()

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.false(helpers.applyPatch.called)
  t.false(contentType.update.called)
  t.true(contentType.delete.called)
})

test('unpublishes the Content Type before deleting it', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  contentType.isPublished = () => true
  contentType.unpublish = sinon.spy()
  contentType.delete = sinon.spy()

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.true(contentType.unpublish.called)
  t.true(contentType.delete.called)
  t.true(contentType.unpublish.calledBefore(contentType.delete))
})

test('does not unpublish a not published Content Type', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  contentType.isPublished = () => false
  contentType.unpublish = sinon.spy()
  contentType.delete = sinon.spy()

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.false(contentType.unpublish.called)
})

test('does not delete the Content Type if the action is not confirmed', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const eventSystem = createEventSystem(false)

  contentType.isPublished = () => true
  contentType.unpublish = sinon.spy()
  contentType.delete = sinon.spy()

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.false(contentType.unpublish.called)
  t.false(contentType.delete.called)
})

test('does not unpublish/delete the Content Type on dry run mode', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  contentType.isPublished = () => true
  contentType.unpublish = sinon.spy()
  contentType.delete = sinon.spy()

  await makePatchHooks(patchSet, contentType, helpers, eventSystem, { dryRun: true })

  t.false(contentType.unpublish.called)
  t.false(contentType.delete.called)
})

test('throws an error on unknown patch set actions', async function (t) {
  const helpers = stubHelpers()
  const contentType = stubContentType()
  const eventSystem = createEventSystem()

  await t.throws(makePatchHooks({ action: 'foo' }, contentType, helpers, eventSystem), /Unknown action "foo"/)
})

test('when omitting a field calls "publish" on the updated Content Type', async function (t) {
  const helpers = stubHelpers()
  const patchSet = {
    action: 'patch',
    patches: [
      { op: 'add', path: '/fields/0/omitted', value: true }
    ]
  }
  const contentType = stubContentType()
  const contentTypeWithOmittedField = stubContentType()
  const eventSystem = createEventSystem()
  contentTypeWithOmittedField.publish = sinon.stub().returns(Bluebird.resolve(stubContentType()))
  contentType.update = () => Bluebird.resolve(contentTypeWithOmittedField)

  await makePatchHooks(patchSet, contentType, helpers, eventSystem)

  t.true(contentTypeWithOmittedField.publish.called)
})

test('regression: contentType.toPlainObject is not undefined', async function (t) {
  const helpers = stubHelpers()
  const patchSet = {
    action: 'create',
    patches: [
      { op: 'add', path: '/name', value: 'Very nice CT' }
    ]
  }
  const space = { createContentTypeWithId: () => Bluebird.resolve(stubContentType()) }
  const eventSystem = createEventSystem()
  const contentType = new ContentTypeProxy('foo', space)

  await t.notThrows(makePatchHooks(patchSet, contentType, helpers, eventSystem))
})
