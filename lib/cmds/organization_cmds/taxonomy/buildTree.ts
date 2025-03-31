type ItemId = string | null
export type Nested<T> = { children: Array<Nested<T>> } & {
  [K in keyof T]: T[K]
}

export function buildTree<T, R extends Nested<T>>(
  arr: T[],
  {
    getItemId,
    getParentIds,
    rootId = null
  }: {
    getItemId(item: T): ItemId
    getParentIds(item: T): ItemId[]
    rootId?: ItemId
  }
): R[] {
  const items = arr as unknown as R[]
  const roots: R[] = []
  const indexByIdMap = new Map<ItemId, number>()

  items.forEach((item, i) => {
    const id = getItemId(item)

    indexByIdMap.set(id, i)
    item.children = []
  })

  items.forEach(item => {
    const parentIds = getParentIds(item)

    for (const parentId of parentIds) {
      if (parentId === rootId) {
        roots.push(item)
      } else {
        const index = indexByIdMap.get(parentId)

        if (index !== undefined) {
          items[index].children.push(item)
        }
      }
    }
  })

  return roots
}
