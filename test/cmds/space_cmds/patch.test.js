import test from 'ava'
import sinon from 'sinon'
import { batchPatch, __RewireAPI__ as rewireBatch } from '../../../lib/cmds/space_cmds/patch'
import stubHelpers from '../content-type_cmds/stubs/_helpers'

test('batch patches', async t => {
  stubHelpers.readPatchDir = () => ['path/a', 'path/b']
  stubHelpers.readPatchFile = (path) => {
    if (path === 'path/a') {
      return {id: '123', action: 'patch', patches: ['beep', 'boop']}
    }

    if (path === 'path/b') {
      return {id: '123', action: 'patch', patches: [{op: 'add', path: '/name', value: 'hello there'}]}
    }
  }
  const applySpy = sinon.stub()
  rewireBatch.__Rewire__('applyPatches', applySpy)
  const mockSpace = {
    getContentType: () => 'test content type'
  }
  await batchPatch(mockSpace, 'patchDir', stubHelpers)
  t.is(applySpy.callCount, 2)
  t.true(applySpy.calledWith(
    { id: '123', action: 'patch', patches: ['beep', 'boop'] },
    'test content type',
    stubHelpers)
  )
  t.true(applySpy.calledWith(
    { id: '123', action: 'patch', patches: [{ op: 'add', path: '/name', value: 'hello there' }] },
    'test content type',
    stubHelpers)
  )
})
