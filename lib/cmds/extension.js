module.exports.command = 'extension'

module.exports.desc = 'Manage and list your extensions'

module.exports.builder = function (yargs) {
  return yargs
    .commandDir('extension_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
