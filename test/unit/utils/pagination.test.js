import { stub } from 'sinon'

import paginate from '../../../lib/utils/pagination'

test('paginates over multi page api results', async () => {
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

  expect(result.items[0].id).toBe('item 1')
  expect(result.items[1].id).toBe('item 2')
  expect(result.items.length).toBe(2)
  expect(exampleMethod.callCount).toBe(2)
})

test('does not paginate over single page api results', async () => {
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

  expect(result.items[0].id).toBe('item 1')
  expect(result.items.length).toBe(1)
  expect(exampleMethod.callCount).toBe(1)
})
