import test from 'ava'
import Bluebird from 'bluebird'
import sinon from 'sinon'

import ContentTypeProxy from '../../../../lib/cmds/content-type_cmds/utils/content-type-proxy'
import applyPatches from '../../../../lib/cmds/content-type_cmds/utils/apply-patches'

import stubContentType from './stubs/_content-type'
import stubHelpers from './stubs/_helpers'

const logStubs = () => {
  return { log: sinon.spy(), success: sinon.spy() }
}

test('saves the Content Type after the patches have been applied', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/required', value: true },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const logging = logStubs()

  contentType.update = function () {
    t.true(this.fields[0].required)
    t.is(this.name, 'New CT')

    return Bluebird.resolve(this)
  }

  await applyPatches(patchSet, contentType, helpers, logging)
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
  const logging = logStubs()

  let result = await applyPatches(patchSet, contentType, helpers, logging)
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
  const logging = logStubs()

  let result = await applyPatches(patchSet, contentType, helpers, logging)
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
  const logging = logStubs()

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

  await applyPatches(patchSet, contentType, helpers, logging)
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
  const logging = logStubs()
  const options = { dryRun: true }

  contentType.update = sinon.spy()

  await applyPatches(patchSet, contentType, helpers, logging, options)

  t.false(contentType.update.called)
})

test('throws when a patch is rejected', async function (t) {
  const helpers = stubHelpers()
  helpers.confirmPatch = sinon.stub().returns(Bluebird.resolve(false))
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'add', path: '/description', value: 'Shinny' },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const logging = logStubs()

  await t.throws(applyPatches(patchSet, contentType, helpers, logging), /Patch application has been aborted/)
})

test('does not ask for confirmation with the "yes" option', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'add', path: '/description', value: 'Shinny' },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const logging = logStubs()

  await applyPatches(patchSet, contentType, helpers, logging, { yes: true })

  t.false(helpers.confirmPatch.called)
})

test('deletes the Content Type when the resulting payload is an empty object', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'remove', path: '/fields' },
    { op: 'remove', path: '/name' }
  ]
  const patchSet = { action: 'patch', patches }
  const contentType = stubContentType()
  const logging = logStubs()
  contentType.delete = sinon.stub().returns(Bluebird.resolve())

  await applyPatches(patchSet, contentType, helpers, logging)

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
  const logging = logStubs()
  let resolved = false
  const promise = Bluebird.delay(500).then(function () { resolved = true; return contentType })
  contentType.update = sinon.stub().returns(promise)

  await applyPatches(patchSet, contentType, helpers, logging)

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
  const logging = logStubs()
  let resolved = false
  const promise = Bluebird.delay(500).then(function () { resolved = true; return contentType })
  contentType.delete = sinon.stub().returns(promise)

  await applyPatches(patchSet, contentType, helpers, logging)

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
  const logging = logStubs()
  let resolved = false
  const promise = Bluebird.delay(500).then(function () { resolved = true; return contentType })
  contentType.publish = sinon.stub().returns(promise)

  await applyPatches(patchSet, contentType, helpers, logging)

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
  const logging = logStubs()
  const promise = Bluebird.delay(500).return(contentType)
  contentType.update = sinon.stub().returns(promise)

  await applyPatches(patchSet, contentType, helpers, logging)

  t.true(promise.isFulfilled())
})

test('deletes the Content Type when the action is "delete"', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const logging = logStubs()

  contentType.isPublished = () => false
  contentType.update = sinon.spy()
  contentType.delete = sinon.spy()
  contentType.unpublish = sinon.spy()

  await applyPatches(patchSet, contentType, helpers, logging)

  t.false(helpers.applyPatch.called)
  t.false(contentType.update.called)
  t.true(contentType.delete.called)
})

test('unpublishes the Content Type before deleting it', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const logging = logStubs()

  contentType.isPublished = () => true
  contentType.unpublish = sinon.spy()
  contentType.delete = sinon.spy()

  await applyPatches(patchSet, contentType, helpers, logging)

  t.true(contentType.unpublish.called)
  t.true(contentType.delete.called)
  t.true(contentType.unpublish.calledBefore(contentType.delete))
})

test('does not unpublish a not published Content Type', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const logging = logStubs()

  contentType.isPublished = () => false
  contentType.unpublish = sinon.spy()
  contentType.delete = sinon.spy()

  await applyPatches(patchSet, contentType, helpers, logging)

  t.false(contentType.unpublish.called)
})

test('does not delete the Content Type if the action is not confirmed', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const logging = logStubs()

  helpers.confirm = sinon.stub().returns(Bluebird.resolve(false))

  contentType.isPublished = () => true
  contentType.unpublish = sinon.spy()
  contentType.delete = sinon.spy()

  await applyPatches(patchSet, contentType, helpers, logging)

  t.false(contentType.unpublish.called)
  t.false(contentType.delete.called)
})

test('does not unpublish/delete the Content Type on dry run mode', async function (t) {
  const helpers = stubHelpers()
  const patchSet = { action: 'delete' }
  const contentType = stubContentType()
  const logging = logStubs()

  contentType.isPublished = () => true
  contentType.unpublish = sinon.spy()
  contentType.delete = sinon.spy()

  await applyPatches(patchSet, contentType, helpers, logging, { dryRun: true })

  t.false(contentType.unpublish.called)
  t.false(contentType.delete.called)
})

test('throws an error on unknown patch set actions', async function (t) {
  const helpers = stubHelpers()
  const contentType = stubContentType()

  await t.throws(applyPatches({ action: 'foo' }, contentType, helpers), /Unknown action "foo"/)
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
  const logging = logStubs()
  contentTypeWithOmittedField.publish = sinon.stub().returns(Bluebird.resolve(stubContentType()))
  contentType.update = () => Bluebird.resolve(contentTypeWithOmittedField)

  await applyPatches(patchSet, contentType, helpers, logging)

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
  const logging = logStubs()
  const contentType = new ContentTypeProxy('foo', space)

  await t.notThrows(applyPatches(patchSet, contentType, helpers, logging))
})
