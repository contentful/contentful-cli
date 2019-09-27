/**
 * Gets all the existing entities based on pagination parameters.
 * The first call will have no aggregated response. Subsequent calls will
 * concatenate the new responses to the original one.
 */
module.exports = async function paginate({
  client,
  method,
  skip = 0,
  limit = 100,
  aggregatedResponse = null,
  query = null
}) {
  const fullQuery = Object.assign(
    {},
    {
      limit,
      skip: skip,
      order: 'sys.createdAt,sys.id'
    },
    query
  )

  const response = await client[method](fullQuery)

  if (!aggregatedResponse) {
    aggregatedResponse = response
  } else {
    aggregatedResponse.items = [...aggregatedResponse.items, ...response.items]
  }
  if (skip + limit < response.total) {
    return paginate({
      client,
      method,
      skip: skip + limit,
      aggregatedResponse,
      query
    })
  }
  return aggregatedResponse
}
