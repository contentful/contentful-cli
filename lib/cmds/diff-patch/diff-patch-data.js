import {diffJson} from 'diff'
import {omit, differenceWith, difference, flatten} from 'lodash'
import jsonpatch from 'fast-json-patch'

const removeForDiff = [ 'sys' ]

export function getPatchesAndDiff (currModel, targetModel) {
  const deletedItems = differenceWith(targetModel, currModel, (x, y) => x.sys.id === y.sys.id)
  const createdItems = differenceWith(currModel, targetModel, (x, y) => x.sys.id === y.sys.id)
  const toPatchItems = difference(currModel, createdItems)
  const patches = []
  const diff = []

  toPatchItems.forEach(currCt => {
    const counterPart = targetModel.find(ct => ct.sys.id === currCt.sys.id)
    patches.push({
      name: currCt.name,
      id: currCt.sys.id,
      action: 'patch',
      patches: getPatchData(counterPart || {}, currCt)
    })
    diff.push({
      name: currCt.name,
      diff: getDiffData(counterPart || {}, currCt)
    })
  })

  createdItems.forEach(createdCt => {
    patches.push({
      name: createdCt.name,
      id: createdCt.sys.id,
      action: 'create',
      patches: [{ op: 'add', path: '', value: omit(createdCt, 'sys') }]
    })
    diff.push({
      name: createdCt.name,
      diff: getDiffData({}, createdCt)
    })
  })

  deletedItems.forEach(deletedCt => {
    patches.push({
      name: deletedCt.name,
      id: deletedCt.sys.id,
      action: 'delete',
      patches: []
    })
    diff.push({
      name: deletedCt.name,
      diff: getDiffData(deletedCt, {})
    })
  })

  return { diff, patches }
}

export function getDiffDataForPatch (tmp, target) {
  return {
    name: tmp.name,
    diff: diffJson(target, tmp)
  }
}

function cleanupModels (models) {
  return models.map(item => {
    return omit(item, removeForDiff)
  })
}

function getDiffData (first, second) {
  let cleaned = cleanupModels([first, second])
  return diffJson(...cleaned).filter(part => part.value !== '{}')
}

function getPatchData (first, second) {
  let cleaned = cleanupModels([first, second])
  return normalizePatches(jsonpatch.compare(...cleaned))
}

function normalizePatches (data) {
  const result = data.map((currentPatch) => {
    // path examples to match `/fields/0` or `/fields/-`
    if (currentPatch.op === 'remove' && currentPatch.path.match(/^\/fields\/(?:\d+|-)$/)) {
      return [
        {op: 'replace', path: `${currentPatch.path}/omitted`, value: true},
        {op: 'add', path: `${currentPatch.path}/deleted`, value: true}
      ]
    }
    return currentPatch
  })
  return flatten(result)
}
