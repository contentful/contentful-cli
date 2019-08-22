export const command = 'alias'

export const desc = 'Manage and list environment aliases'

export const builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('alias_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
