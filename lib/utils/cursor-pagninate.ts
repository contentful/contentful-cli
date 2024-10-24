import { CursorPaginatedCollectionProp } from 'contentful-management/dist/typings/common-types'

export async function cursorPaginate<T>({
  queryPage
}: {
  queryPage: (pageUrl?: string) => Promise<CursorPaginatedCollectionProp<T>>
}): Promise<Array<T>> {
  // Fetch the first page
  const data = await queryPage()
  const { pages, items } = data

  let nextPage = pages?.next

  while (nextPage) {
    const next = await queryPage(nextPage)
    items.push(...next.items)
    nextPage = next.pages?.next
  }

  return items
}
