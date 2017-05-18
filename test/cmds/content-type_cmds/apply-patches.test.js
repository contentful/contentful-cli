import test from 'ava'
import Bluebird from 'bluebird'
import sinon from 'sinon'

import applyPatches from '../../../lib/cmds/content-type_cmds/utils/apply-patches'

import stubContentType from './stubs/_content-type'
import stubHelpers from './stubs/_helpers'

test('saves the Content Type after the paches have been applied', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/required', value: true },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const contentType = stubContentType()

  contentType.update = function () {
    t.true(this.fields[0].required)
    t.is(this.name, 'New CT')

    return Bluebird.resolve()
  }

  await applyPatches(patches, contentType, helpers)
})

test('saves the Content Type right after a field is omitted', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'add', path: '/description', value: 'Shinny' },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const contentType = stubContentType()

  contentType.update = sinon.stub()
  contentType.update.onFirstCall().callsFake(function () {
    t.true(this.fields[0].omitted)
    t.is(this.name, 'CT')
    t.is(this.description, undefined)

    return Bluebird.resolve()
  })
  contentType.update.onSecondCall().callsFake(function () {
    t.is(this.name, 'New CT')
    t.is(this.description, 'Shinny')

    return Bluebird.resolve()
  })

  await applyPatches(patches, contentType, helpers)
})

test('on dry run does not save the Content Type', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'add', path: '/description', value: 'Shinny' },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const contentType = stubContentType()
  const options = { dryRun: true }

  contentType.update = sinon.spy()

  await applyPatches(patches, contentType, helpers, options)

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
  const contentType = stubContentType()

  await t.throws(applyPatches(patches, contentType, helpers), /Patch application has been aborted/)
})

test('does not ask for confirmation with the "noConfirm" option', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'add', path: '/fields/0/omitted', value: true },
    { op: 'add', path: '/description', value: 'Shinny' },
    { op: 'replace', path: '/name', value: 'New CT' }
  ]
  const contentType = stubContentType()

  await applyPatches(patches, contentType, helpers, { noConfirm: true })

  t.false(helpers.confirmPatch.called)
})

test('deletes the Content Type when the resulting payload is an empty object', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    { op: 'remove', path: '/fields' },
    { op: 'remove', path: '/name' }
  ]
  const contentType = stubContentType()
  contentType.delete = sinon.stub().returns(Bluebird.resolve())

  await applyPatches(patches, contentType, helpers)

  t.true(contentType.delete.called)
  t.is(contentType.delete.callCount, 1)
})
