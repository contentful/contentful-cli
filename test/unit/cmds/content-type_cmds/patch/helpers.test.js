import test from 'ava'
import { join } from 'path'
import Bluebird from 'bluebird'

import {
  transformPath,
  readPatchDir,
  __RewireAPI__ as helpersRewireAPI
} from '../../../../../lib/cmds/content-type_cmds/patch/helpers'

test('Does not transform the path when it uses an index numer', (t) => {
  const path = '/fields/0/name'
  const contentType = { name: 'foo', description: 'bar', fields: [ {id: 'lol'} ] }

  const transformed = transformPath(contentType, path)

  t.is(transformed, path)
})

test('"transformPath" returns the path when the Content Type has no fields', (t) => {
  const path = '/description'
  const contentType = { name: 'foo', description: 'bar' }

  t.is(transformPath(contentType, path), '/description')
})

test('"readPatchDir" returns all files in a path that match the file name format', async (t) => {
  const allFiles = [
    'some-file.json',
    'contentful-patch-foobar-123123.json',
    'contentful-patch-barfoo-123123.json',
    'something-else.jpg'
  ]

  const results = [
    join('foo', 'contentful-patch-foobar-123123.json'),
    join('foo', 'contentful-patch-barfoo-123123.json')
  ]

  helpersRewireAPI.__Rewire__('readDir', (path) => {
    return Bluebird.resolve(allFiles)
  })

  const patchFiles = await readPatchDir('foo')

  t.deepEqual(patchFiles, results)

  helpersRewireAPI.__ResetDependency__('readDir')
})
