import test from 'ava'

import { transformPath } from '../../../../lib/cmds/content-type_cmds/patch/helpers'

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
