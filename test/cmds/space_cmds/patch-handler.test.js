import test from 'ava'
import sinon from 'sinon'
import Bluebird from 'bluebird'

import patchHandler from '../../../lib/cmds/space_cmds/patch-handler'

const loggingStubs = () => ({ log: sinon.spy() })

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
  const applyPatchesSpy = sinon.spy()
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
