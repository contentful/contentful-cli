import test from 'ava'
import Bluebird from 'bluebird'
import sinon from 'sinon'

import applyPatch from '../../../lib/cmds/content-type_cmds/utils/apply-patch'

import stubContentType from './stubs/_content-type'
import stubHelpers from './stubs/_helpers'

test('applies the patches and returns the modified Content Type', async function (t) {
  const helpers = stubHelpers()
  const hooks = {
    before: () => {},
    after: sinon.stub().returns(Bluebird.resolve(true))
  }

  const patches = [
    {op: 'replace', path: '/fields/0/name', value: 'foo'},
    {op: 'add', path: '/fields/0/required', value: true},
    {op: 'add', path: '/fields/0/localized', value: true}
  ]

  const contentType = stubContentType()

  const patchedContentType = await applyPatch(patches, contentType, helpers, hooks)

  const patchedFields = patchedContentType.fields

  t.is(helpers.applyPatch.callCount, 6)
  t.is(patchedFields[0].name, 'foo')
  t.is(patchedFields[0].required, true)
  t.is(patchedFields[0].localized, true)
})

test('calls the "before" hook before applying each patch', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    {op: 'replace', path: '/fields/0/name', value: 'foo'}
  ]

  const contentType = stubContentType()
  const hooks = {
    before: (patch, ct) => {
      t.is(helpers.applyPatch.callCount, 1)
      t.is(patch, patches[0])
      t.deepEqual(ct, contentType)
    },
    after: sinon.stub()
  }

  await applyPatch(patches, contentType, helpers, hooks)
})

test('calls the "after" hook after applying each patch', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    {op: 'replace', path: '/fields/0/name', value: 'foo'}
  ]
  const hooks = {
    before: () => {},
    after: (patch, ct) => {
      t.is(helpers.applyPatch.callCount, 2)
      t.is(patch, patches[0])
      t.is(ct.fields[0].name, 'foo')
    }
  }

  const contentType = stubContentType()

  await applyPatch(patches, contentType, helpers, hooks)
})
