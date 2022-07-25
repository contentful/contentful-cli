import { commands } from './accesstoken_cmds/index.mjs'

export const command = 'accesstoken'

export const desc = 'Manage and list your delivery access tokens'

export const aliases = ['at']

export const builder = function (yargs) {
  return yargs
    .command(commands)
    .demandCommand(5, 'Please specify a sub command.')
}
