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
  if (typeof value === 'boolean') {
    return chalk.magenta(value.toString())
  }
  return value
}

const Formatter = {
  type: (value: string) => chalk.bold(value),
  id: (value: string) => chalk.yellow(value),
  value: (value: string | number | boolean) => valueTypeFormatter(value),
  record: (value: string) => chalk.italic(value),
  property: (value: string) => chalk.yellow(value)
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
          Formatter.record(`type: ${Formatter.type('ContentType')}`),
          Formatter.record(`id: ${Formatter.id(item.entity.sys.id)}`)
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
          Formatter.record(`type: ${Formatter.type('ContentType')}`),
          Formatter.record(`id: ${Formatter.id(item.entity.sys.id)}`)
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
          Formatter.record(`type: ${Formatter.type('ContentType')}`),
          Formatter.record(`id: ${Formatter.id(item.entity.sys.id)}`)
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
          messages.push(Formatter.record(`type: ${Formatter.type('Field')}`))
        } else {
          messages.push(
            Formatter.record(`type: ${Formatter.type('ContentType')}`)
          )
        }

        if (isFieldValueChange) {
          messages.push(Formatter.record(`id: ${Formatter.id(key)}`))
        } else {
          messages.push(
            Formatter.record(`property: ${Formatter.property(key)}`)
          )
        }

        const fieldValueChange = fieldChange(operation)
        if (fieldValueChange && fieldValueChange.length > 0) {
          messages.push(
            Formatter.record(
              `property: ${Formatter.property(fieldValueChange)}`
            )
          )
        }

        if (isChangeOperation) {
          messages.push(
            Formatter.record(`value: ${Formatter.value(operation.value)}`)
          )
        }

        if (isAddOperation) {
          messages.push(
            Formatter.record(
              `value: ${Formatter.value(
                truncate(JSON.stringify(operation.value), { length: 48 })
              )}`
            )
          )
        }

        if (isMoveOperation) {
          if (isNestedMoveOperation(operation)) {
            messages.push(Formatter.record(`position: order changed`))
          } else {
            const fromIndex = getLastIndexFromPath(operation.from)
            const toIndex = getLastIndexFromPath(operation.path)
            const direction = fromIndex < toIndex ? 'down' : 'up'

            messages.push(Formatter.record(`position: moved ${direction}`))
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
