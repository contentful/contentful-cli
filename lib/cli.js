import yargs from 'yargs'

yargs.usage('\nUsage: contentful <cmd> [args]')
.commandDir('cmds')
.demandCommand(4, 'Please specify a command.')
.help('h')
.alias('h', 'help')
.strict()
.version()
.epilog('Copyright 2017 Contentful, this is a BETA release')
.parse(process.argv)
