import yargs from 'yargs'

yargs.usage('\nUsage: contentful <cmd> [args]')
.commandDir('cmds')
.demandCommand(4, 'Please specify a command.')
.help('h')
.alias('h', 'help')
.strict()
.version()
.parse(process.argv)
