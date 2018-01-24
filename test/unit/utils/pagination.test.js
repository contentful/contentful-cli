import test from 'ava'
import { stub } from 'sinon'

import paginate from '../../../lib/utils/pagination'

test('paginates over multi page api results', async (t) => {
  const exampleMethod = stub()
  exampleMethod.onCall(0).returns({
    items: [{
      id: 'item 1'
    }],
    skip: 0,
    limit: 1,
    total: 2
  })
  exampleMethod.onCall(1).returns({
    items: [{
      id: 'item 2'
    }],
    skip: 1,
    limit: 1,
    total: 2
  })
  const client = {
    exampleMethod
  }
  const result = await paginate({ client, method: 'exampleMethod', limit: 1 })

  t.is(result.items[0].id, 'item 1')
  t.is(result.items[1].id, 'item 2')
  t.is(result.items.length, 2)
  t.is(exampleMethod.callCount, 2)
})

test('does not paginate over single page api results', async (t) => {
  const exampleMethod = stub()
  exampleMethod.returns({
    items: [{
      id: 'item 1'
    }],
    skip: 0,
    limit: 1,
    total: 1
  })
  const client = {
    exampleMethod
  }
  const result = await paginate({ client, method: 'exampleMethod', limit: 1 })

  t.is(result.items[0].id, 'item 1')
  t.is(result.items.length, 1)
  t.is(exampleMethod.callCount, 1)
})
