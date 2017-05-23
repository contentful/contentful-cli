import test from 'ava'
import sinon from 'sinon'
import Bluebird from 'bluebird'

import stubContentType from './stubs/_content-type'
import ContentTypeProxy from '../../../lib/cmds/content-type_cmds/utils/content-type-proxy'

test('returns the plain object', t => {
  const space = 'fake-space'
  const contentType = new ContentTypeProxy('foo', space)

  contentType.name = 'My CT'
  contentType.description = 'Very Content Type'
  contentType.fields = [{ id: 'field' }]

  t.deepEqual(contentType.toPlainObject(), {
    name: 'My CT',
    description: 'Very Content Type',
    fields: [{ id: 'field' }]
  })
})

test('creates the Content Type', async function (t) {
  const newContentType = stubContentType()
  const space = {
    createContentTypeWithId: sinon.stub().returns(Bluebird.resolve(newContentType))
  }
  const contentType = new ContentTypeProxy('foo', space)

  contentType.name = 'My CT'
  contentType.description = 'Very Content Type'
  contentType.fields = [{ id: 'field' }]

  const result = await contentType.update()

  t.true(space.createContentTypeWithId.firstCall.calledWith('foo', {
    name: 'My CT',
    description: 'Very Content Type',
    fields: [{ id: 'field' }]
  }))
  t.is(result, newContentType)
})

test('it updates once the Content Type has been created', async function (t) {
  const stubbedContentType = stubContentType()
  sinon.spy(stubbedContentType, 'update')
  const space = {
    createContentTypeWithId: sinon.stub().returns(Bluebird.resolve(stubbedContentType))
  }
  const contentType = new ContentTypeProxy('foo', space)

  await contentType.update() // creates content Type
  await contentType.update() // updates the new content type

  t.is(space.createContentTypeWithId.callCount, 1)
  t.is(stubbedContentType.update.callCount, 1)
})
