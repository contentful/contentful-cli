module.exports.command = 'generate'

module.exports.desc = 'Generate code for different tasks'

module.exports.builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('generate_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

module.exports.aliases = ['g']
