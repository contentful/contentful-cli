export const command = 'generate'

export const desc = 'Generate code for different tasks'

export const builder = function (yargs) {
  return yargs
    .usage('')
    .commandDir('generate_cmds')
    .demandCommand(4, 'Please specify a sub command.')
}

export const aliases = ['g']
