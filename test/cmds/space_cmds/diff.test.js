import test from 'ava'
import * as diff from '../../../lib/cmds/space_cmds/diff/index'

test('getDiffOrPatchData removes unneeded props from content types', t => {
  const ct1 = {
    sys: null,
    version: null,
    firstPublishedAt: null,
    name: 'foo',
    publishedAt: null,
    publishedBy: null

  }
  const ct2 = {
    publishedCounter: null,
    publishedVersion: null,
    updatedAt: null,
    displayName: 'bar',
    updatedBy: null
  }

  function fakeCompare (x, y) {
    const cleanedX = {
      name: 'foo'
    }
    const cleanedY = {
      displayName: 'bar'
    }
    t.deepEqual(x, cleanedX)
    t.deepEqual(y, cleanedY)
  }

  diff.getDiffOrPatchData(ct1, ct2, fakeCompare)
})
