import type { Argv } from 'yargs'

export const command = 'asset'
export const desc = 'Manage assets'
export const builder = function (yargs: Argv): Argv {
  return yargs
    .commandDir('asset_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
