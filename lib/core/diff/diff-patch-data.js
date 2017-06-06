import {diffJson} from 'diff'
import { omit, differenceWith, difference } from 'lodash'

import { getPatchData } from './get-patch-data'
import { cleanupModels } from '../../utils/patches'

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

function getDiffData (first, second) {
  let cleaned = cleanupModels([first, second])
  return diffJson(...cleaned).filter(part => part.value !== '{}')
}
