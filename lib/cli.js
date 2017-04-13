import yargs from 'yargs'

import login from './login'
import logout from './logout'
import guide from './guide'

yargs.usage('\nUsage: contentful <cmd> [args]')
.command('login', 'Login to Contentful', {}, login)
.command('logout', 'Logout from Contentful', {}, logout)
.command('guide', 'Contentful guide - Learn what u can do with contentful', {}, guide)
.example('$0 login', 'Logs you in to Contentful')
.help('h')
.alias('h', 'help')
.wrap(72)
.version()
.parse(process.argv)
