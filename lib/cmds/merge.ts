import type { Argv } from 'yargs'

module.exports.command = 'merge'

module.exports.desc = 'A CLI version of the Merge app'

module.exports.builder = function (yargs: Argv) {
  return yargs
    .usage('')
    .commandDir('merge_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}
