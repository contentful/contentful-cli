interface PaginationParams<T> {
  client: {
    [key: string]: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query?: Record<string, any>
    ) => Promise<PaginatedResponse<T>>
  }
  method: string
  skip?: number
  limit?: number
  aggregatedResponse?: PaginatedResponse<T> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query?: Record<string, any> | null
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

/**
 * Gets all the existing entities based on pagination parameters.
 * The first call will have no aggregated response. Subsequent calls will
 * concatenate the new responses to the original one.
 */
export default async function paginate<T>({
  client,
  method,
  skip = 0,
  limit = 100,
  aggregatedResponse = null,
  query = null
}: PaginationParams<T>): Promise<PaginatedResponse<T>> {
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

  return aggregatedResponse || { items: [], total: 0, skip: 0, limit: 0 }
}
