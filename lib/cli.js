import yargs from 'yargs'

yargs.usage('\nUsage: contentful <cmd> [args]')
.commandDir('cmds')
.help('h')
.alias('h', 'help')
.wrap(72)
.version()
.parse(process.argv)
