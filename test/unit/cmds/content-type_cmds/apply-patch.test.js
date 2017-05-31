import test from 'ava'
import Bluebird from 'bluebird'
import sinon from 'sinon'

import applyPatch from '../../../../lib/cmds/content-type_cmds/utils/apply-patch'

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

  const maybePatched = await applyPatch(patches, contentType, helpers, hooks)

  const patchedFields = maybePatched.contentType.fields

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
    before: ({ patch, contentType }) => {
      t.is(helpers.applyPatch.callCount, 1)
      t.is(patch, patches[0])
      t.deepEqual(contentType, contentType)
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
    after: ({ patch, contentType }) => {
      t.is(helpers.applyPatch.callCount, 2)
      t.is(patch, patches[0])
      t.is(contentType.fields[0].name, 'foo')
    }
  }

  const contentType = stubContentType()

  await applyPatch(patches, contentType, helpers, hooks)
})

test('differences in "sys" properties do not result in patch application', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    {op: 'add', path: '', value: {name: 'foo', fields: []}}
  ]
  const hooks = {
    before: () => {
      // this shouldn't be called
      t.fail('hook should not have been called')
    },
    after: () => {
      // this shouldn't be called
      t.fail('hook should not have been called')
    }
  }

  // Note that the only difference between the stubbed CT and the one resulting from
  // the patch is the presence of the 'sys' objece
  const contentType = stubContentType({name: 'foo', fields: [], sys: {id: 1}})

  await applyPatch(patches, contentType, helpers, hooks)

  t.is(helpers.applyPatch.callCount, 1)
})

test('differences in "sys" properties do not result in diff printing', async function (t) {
  const helpers = stubHelpers()
  const patches = [
    {op: 'add', path: '', value: {name: 'foo', fields: []}}
  ]
  const hooks = {
    before: () => {
      // this shouldn't be called
      t.fail('hook should not have been called')
    },
    after: () => {
      // this shouldn't be called
      t.fail('hook should not have been called')
    }
  }

  // Note that the only difference between the stubbed CT and the one resulting from
  // the patch is the presence of the 'sys' objece
  const contentType = stubContentType({name: 'foo', fields: [], sys: {id: 1}})

  await applyPatch(patches, contentType, helpers, hooks)

  t.false(helpers.prettyDiff.called)
})
