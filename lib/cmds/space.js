export const command = 'space'

export const desc = 'Manage and list your spaces'

export const builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('space_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
