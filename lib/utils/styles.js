const chalk = require('chalk');

chalk.enabled = process.env.BABEL_ENV !== 'test'

export const successStyle = chalk.green
export const warningStyle = chalk.yellow
export const errorStyle = chalk.red
export const highlightStyle = chalk.cyan
export const codeStyle = chalk.dim
export const pathStyle = chalk.cyan.underline
