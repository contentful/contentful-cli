import { Host } from '../app-actions-config'

export interface BaseOperation {
  path: string
}

export interface AddOperation<T = any> extends BaseOperation {
  op: 'add'
  value: T
}

export interface RemoveOperation extends BaseOperation {
  op: 'remove'
}

export interface ReplaceOperation<T = any> extends BaseOperation {
  op: 'replace'
  value: T
}

export interface MoveOperation extends BaseOperation {
  op: 'move'
  from: string
}

export type Operation =
  | AddOperation
  | RemoveOperation
  | ReplaceOperation
  | MoveOperation

type EntityLink = {
  sys: {
    id: string
    linkType: 'ContentType' | 'EditorInterface'
    type: 'Link'
  }
}

export type AddChangesetItem = {
  changeType: 'add'
  entity: EntityLink
  data: any
}

export type DeleteChangesetItem = {
  changeType: 'delete'
  entity: EntityLink
}

export type UpdateChangesetItem = {
  changeType: 'update'
  entity: EntityLink
  patch: Operation[]
}

export type ChangesetItem =
  | AddChangesetItem
  | DeleteChangesetItem
  | UpdateChangesetItem

export interface MergeContext {
  activeSpaceId: string
  host?: Host
  managementToken?: string
}
