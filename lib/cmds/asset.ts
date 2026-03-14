export const command = 'asset'
export const desc = 'Manage assets'
export const builder = function (yargs: any) {
  return yargs
    .commandDir('asset_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
