export const command = 'entry'
export const desc = 'Manage entries'
export const builder = function (yargs: any) {
  return yargs
    .commandDir('entry_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
