import chalk from 'chalk'
import { ContentTypeProps } from 'contentful-management'
import { orderBy, truncate } from 'lodash'
import { ChangesetItem, UpdateChangesetItem } from './types'
import {
  fieldChange,
  fieldIndex,
  getChangeKey,
  getFieldIdForIndex,
  getLastIndexFromPath,
  getNestedPropertyNames,
  isNestedMoveOperation
} from './utils'

type MessageChangeType = 'add' | 'delete' | 'update'

export type Message = {
  changeType: MessageChangeType
  filterStr: string
  level: number
  messages: string[]
}

type KnownOperations = 'add' | 'replace' | 'move' | 'copy' | 'remove' | 'test'

const filterBase = (item: ChangesetItem): string => {
  return `contentTypes/${item.entity.sys.id}`
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const patchOperationToChangeType: Record<KnownOperations, MessageChangeType> = {
  replace: 'update',
  move: 'update',
  copy: 'update',
  remove: 'delete',
  add: 'add'
}

const valueTypeFormatter = (value: string | number | boolean) => {
  if (typeof value === 'string') {
    return `"${value}"`
  }
  return value
}

const arrowSymbol = (direction: 'up' | 'down') =>
  direction === 'up' ? '↑' : '↓'

const tab = (width: 1 | 2 | 3) => ' '.repeat(width)

const Formatter = {
  id: (value: string) => chalk.yellow(value),
  value: (value: string | number | boolean) => valueTypeFormatter(value),
  title: (value: string) => tab(1) + value,
  subtitle: (value: string) => tab(3) + value,
  details: (value: string) => tab(3) + chalk.bold.dim(value)
}

export function createMessageLogStructure(
  targetModel: ContentTypeProps[],
  changesetItems: ChangesetItem[]
): {
  added: Message[]
  deleted: Message[]
  updated: Message[]
} {
  const toBeAdded: Message[] = changesetItems
    .filter(item => item.changeType === 'add')
    .map(item => {
      return {
        filterStr: filterBase(item),
        changeType: 'add',
        level: 0,
        messages: [
          Formatter.title('ContentType'),
          Formatter.title(`id: ${Formatter.id(item.entity.sys.id)}`)
        ]
      }
    })

  const toBeDeleted: Message[] = changesetItems
    .filter(item => item.changeType === 'delete')
    .map(item => {
      return {
        filterStr: filterBase(item),
        changeType: 'delete',
        level: 0,
        messages: [
          Formatter.title('ContentType'),
          Formatter.title(`id: ${Formatter.id(item.entity.sys.id)}`)
        ]
      }
    })

  const toBeChanged: Message[] = changesetItems
    .filter(item => item.changeType === 'update')
    // hacking types
    .map(item => item as UpdateChangesetItem)
    .reduce((contentTypeMessages, item) => {
      contentTypeMessages.push({
        filterStr: filterBase(item),
        changeType: 'update',
        level: 0,
        messages: [
          Formatter.title('ContentType'),
          Formatter.title(`id: ${Formatter.id(item.entity.sys.id)}`)
        ]
      })

      for (const operation of item.patch) {
        const messages = []

        let key = getChangeKey(operation)
        const isFieldValueChange = operation.path.startsWith('/fields/')
        const isChangeOperation = operation.op === 'replace'
        const isAddOperation = operation.op === 'add'
        const isMoveOperation = operation.op === 'move'

        if (isFieldValueChange) {
          // if it is a field move operation, we need the initial field index
          // to retrieve the field id
          const indexForFieldId = isMoveOperation
            ? fieldIndex(operation.from)
            : fieldIndex(operation.path)

          key = getFieldIdForIndex(
            targetModel,
            item.entity.sys.id,
            indexForFieldId
          )

          // at this point, the field doesn't exist on the target model
          if (isAddOperation) {
            key = operation.value.id
          }
          messages.push(Formatter.title('Field'))
        } else {
          messages.push(Formatter.title('ContentType'))
        }

        if (isFieldValueChange) {
          messages.push(Formatter.subtitle(`id: ${Formatter.id(key)}`))
        } else {
          messages.push(Formatter.details(`property: ${key}`))
        }

        const fieldValueChange = fieldChange(operation)
        const isNestedMove = isNestedMoveOperation(operation)

        if (fieldValueChange) {
          if (isNestedMove) {
            const propChain = getNestedPropertyNames(operation)

            messages.push(
              Formatter.details(`property: ${propChain.join(' -> ')}`)
            )
          } else if (fieldValueChange.length > 0) {
            messages.push(Formatter.details(`property: ${fieldValueChange}`))
          }
        }

        if (isChangeOperation) {
          messages.push(
            Formatter.details(`value: ${Formatter.value(operation.value)}`)
          )
        }

        if (isAddOperation) {
          const stringifiedValue = JSON.stringify(operation.value, null, 2)
          const valueInLines = stringifiedValue.split('\n') as string[]

          // we display the first three lines, and indicate that it's truncated with "..."
          messages.push(Formatter.details(`value:`))
          ;[...valueInLines.slice(1, 4), '  ...'].map(line =>
            messages.push(Formatter.details(line))
          )
        }

        if (isMoveOperation) {
          if (isNestedMove) {
            messages.push(Formatter.details(`position: ↕ order changed`))
          } else {
            const fromIndex = getLastIndexFromPath(operation.from)
            const toIndex = getLastIndexFromPath(operation.path)
            const direction = fromIndex < toIndex ? 'down' : 'up'

            messages.push(
              Formatter.details(
                `position: ${arrowSymbol(direction)} moved ${direction}`
              )
            )
          }
        }

        contentTypeMessages.push({
          filterStr: `${filterBase(item)}${operation.path}`,
          level: 1,
          changeType: patchOperationToChangeType[operation.op],
          messages
        })
      }
      return orderBy(contentTypeMessages, ['type'])
    }, [] as Message[])

  return {
    added: toBeAdded,
    deleted: toBeDeleted,
    updated: toBeChanged
  }
}
