import {diffJson} from 'diff'
import { flatten } from 'lodash'

import patchUtils from './helpers/patches'

const FIELD_PATH_REGEX = /^\/fields\/([^/]+)$/

const isFieldPath = (path) => FIELD_PATH_REGEX.test(path)
const fieldIdFromPath = (path) => (path.match(FIELD_PATH_REGEX) || [])[1]
const isDeletedPropertyPath = (path) => /^\/fields\/\w+\/deleted$/.test(path)
const isOmittedPropertyPath = (path) => /^\/fields\/\w+\/omitted$/.test(path)

// path examples to match `/fields/0`, `/fields/myId` or `/fields/-`
const isFieldRemoval = (currentPatch) => currentPatch.op === 'remove' && currentPatch.path.match(FIELD_PATH_REGEX)

const isFieldDeletion = ({ op, path, value }) => {
  // Field was completely removed
  if (op === 'remove' && isFieldPath(path)) {
    return true
  }
  // `deleted` was added
  if (op === 'add' && isDeletedPropertyPath(path)) {
    return true
  }
  // `deleted` was `false` and changed to `true`
  if (op === 'replace' && isDeletedPropertyPath(path) && value === true) {
    return true
  }

  return false
}

const isFieldOmission = ({ op, path, value }) => {
  // `omitted` was added
  if (op === 'add' && isOmittedPropertyPath(path)) {
    return true
  }
  // `omitted` was `false` and changed to `true`
  if (op === 'replace' && isOmittedPropertyPath(path) && value === true) {
    return true
  }

  return false
}

const isFieldAddition = ({ op, path, value }) => {
  return !isFieldDeletion({ op, path, value }) &&
         !isFieldOmission({ op, path, value }) &&
         op === 'add' && isFieldPath(path)
}

const isOther = (patch) => {
  return !isFieldAddition(patch) &&
         !isFieldDeletion(patch) &&
         !isFieldOmission(patch)
}

const findInContentType = (ct) => (path) => {
  const fieldId = fieldIdFromPath(path)
  return ct.fields.find(({ id }) => id === fieldId)
}

const removalsToDeleteOps = (data, base) => {
  const findField = findInContentType(base)
  const result = data.map((currentPatch) => {
    if (!isFieldRemoval(currentPatch)) {
      return currentPatch
    }

    const field = findField(currentPatch.path)
    const op = ('omitted' in field) ? 'replace' : 'add'

    return [
      {op, path: `${currentPatch.path}/omitted`, value: true},
      {op: 'add', path: `${currentPatch.path}/deleted`, value: true}
    ]
  })
  return flatten(result)
}

export function getDiffDataForPatch (tmp, target) {
  return {
    name: tmp.name,
    diff: diffJson(target, tmp).filter(part => part.value !== '{}')
  }
}

export function getPatchData (first, second) {
  const [base, target] = patchUtils.cleanupModels([first, second])

  const changes = patchUtils.compareAsObject(base, target)

  // Since a diff between two CTs will result in a `remove` op for all fields no longer present,
  // but the API needs to do it in a two step process with an omission first,
  // go ahead and turn all removals into a `omit` and `delete` sequence
  const normalizedChanges = removalsToDeleteOps(changes, base)

  const deletions = normalizedChanges.filter(isFieldDeletion)
  const omissions = normalizedChanges.filter(isFieldOmission)
  // Only append to fields
  const additions = normalizedChanges.filter(isFieldAddition)
    .map((patch) => ({ ...patch, path: '/fields/-' }))
  const other = normalizedChanges.filter((patch) => isOther(patch))

  // Restore the wanted fields order by moving added fields to proper position
  const baseFieldsOrder = patchUtils.fields(base).map(({ id }) => id)
  const targetFieldsOrder = patchUtils.fields(target).map(({ id }) => id)

  const currentFieldsOrder = patchUtils.getCurrentFieldsOrder(baseFieldsOrder, deletions, additions)
  const moves = patchUtils.getMovePatches(currentFieldsOrder, targetFieldsOrder)

  const patches = [...omissions, ...deletions, ...additions, ...other, ...moves]

  return patches
}
