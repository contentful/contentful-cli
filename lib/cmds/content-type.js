export const command = 'content-type'
export const aliases = ['ct']

export const desc = 'Manage and list your space content types'

export const builder = function (yargs) {
  return yargs
    .commandDir('content-type_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
