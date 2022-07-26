/**
 * Paginate through entities based on totalPerPage parameter.
 */
module.exports = function Paginator({
  client,
  method,
  totalPerPage,
  query = null
}) {
  this.page = 0
  this.totalPages = 0
  this.totalItems = 0
  this.isFulfilled = false

  const getQuery = () => ({
    limit: totalPerPage,
    order: 'sys.createdAt,sys.id',
    skip: (this.page - 1) * totalPerPage,
    ...query
  })

  this.next = async () => {
    if (this.isFulfilled) {
      return
    }

    this.page++
    const response = await client[method](getQuery())

    this.totalItems = response.total
    this.totalPages = Math.ceil(response.total / totalPerPage)
    this.isFulfilled = this.page === this.totalPages

    return response.items
  }
}
