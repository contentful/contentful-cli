import jsonpatch from 'fast-json-patch'
import { without, omit } from 'lodash'

const removeForDiff = [ 'sys' ]

export const fields = (ct = {}) => ct.fields || []

const extractDeletedFieldIdFromPath = (path) => path.replace(/^\/fields\/(\w+)\/\w+$/, '$1')
const deletedFieldIdFromPatch = ({ path }) => extractDeletedFieldIdFromPath(path)

function move (list, element, targetIndex) {
  const stable = list.slice(0, targetIndex)
  const rest = without(list.slice(targetIndex), element)
  return [...stable, element, ...rest]
}

export function getMovePatches (currentOrder, targetOrder) {
  const { patches } = targetOrder.reduce((acc, fieldId, targetIndex) => {
    const { currentOrder, patches } = acc
    const currentIndex = currentOrder.findIndex((el) => el === fieldId)

    if (currentIndex === targetIndex) {
      return acc
    }

    const patch = { op: 'move', from: `/fields/${currentIndex}`, path: `/fields/${targetIndex}` }
    const nextCurrentOrder = move(currentOrder, fieldId, targetIndex)
    const nextPatches = [...patches, patch]

    return { currentOrder: nextCurrentOrder, patches: nextPatches }
  }, { patches: [], currentOrder })

  return patches
}

export function getCurrentFieldsOrder (previousFieldsOrder, deletions, additions) {
  const remainingIds = without(previousFieldsOrder, ...deletions.map(deletedFieldIdFromPatch))
  const addedIds = additions.map(({ value: { id } }) => id)
  return [...remainingIds, ...addedIds]
}

export function compareAsObject (base, target) {
  const baseFields = fields(base).reduce((obj, field) => ({ ...obj, [field.id]: field }), {})
  const nextBase = { ...base, fields: baseFields }
  const targetFields = fields(target).reduce((obj, field) => ({ ...obj, [field.id]: field }), {})
  const nextTarget = { ...target, fields: targetFields }

  return jsonpatch.compare(nextBase, nextTarget)
}

export function cleanupModels (models) {
  return models.map(item => {
    return omit(item, removeForDiff)
  })
}

export default {
  fields,
  getMovePatches,
  compareAsObject,
  getCurrentFieldsOrder,
  cleanupModels
}
