module.exports.command = 'config'

module.exports.desc = 'Manage and list your configs'

module.exports.builder = function (yargs) {
  return yargs
    .commandDir('config_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
