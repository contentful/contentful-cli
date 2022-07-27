import * as create from './create.mjs'
import * as deleteCommand from './delete.mjs'
import * as get from './get.mjs'
import * as list from './list.mjs'
import * as update from './update.mjs'

export const commands = [create, deleteCommand, get, list, update]
