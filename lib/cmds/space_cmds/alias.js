module.exports.command = 'environment-alias'

module.exports.desc = 'Manage and list environment aliases'

module.exports.builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('alias_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
