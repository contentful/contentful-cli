module.exports.command = 'content-type'
module.exports.aliases = ['ct']

module.exports.desc = 'Manage and list your space content types'

module.exports.builder = function (yargs) {
  return yargs
    .commandDir('content-type_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
