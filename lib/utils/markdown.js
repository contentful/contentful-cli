const { marked } = require('marked')
const chalk = require('chalk')

const {
  codeStyle,
  pathStyle,
  headingStyle,
  blockQuoteStyle,
  htmlStyle,
  pathTextStyle
} = require('./styles')

function CustomRenderer() {
  const renderer = new marked.Renderer()

  // Block Level Methods
  renderer.code = (code, infoString) => {
    const info = infoString ? chalk.italic(`${infoString}\n`) : ''
    return `${info}${codeStyle(code)}\n\n`
  }
  renderer.heading = (text, level) =>
    `${level === 1 ? '\n' : ''}${headingStyle(text)}\n\n`
  renderer.paragraph = text => `${text}\n\n`
  renderer.blockquote = code => `${blockQuoteStyle(code)}\n`
  renderer.html = arg => `${htmlStyle(arg)}\n`
  renderer.hr = () =>
    `${chalk.underline(Array(process.stdout.columns).join('_'))}\n\n`

  // Inline Level Methods
  renderer.strong = chalk.bold
  renderer.em = chalk.italic
  renderer.del = chalk.strikethrough
  renderer.codespan = codeStyle
  renderer.br = () => '\n'
  renderer.link = (href, _, text) => {
    if (href === text) return pathStyle(href)
    return `${pathTextStyle(text)} (${pathStyle(href)})`
  }

  const renderEmpty = () => ''
  // Not implemented
  renderer.listitem = renderEmpty
  renderer.list = renderEmpty
  renderer.checkbox = renderEmpty
  renderer.tablerow = renderEmpty
  renderer.tablecell = renderEmpty
  renderer.table = renderEmpty
  renderer.image = renderEmpty

  return renderer
}

const sanitizeString = (string = '') => {
  return string.replace(/([^\r\n])(```)(.*)/g, '$1\n```$3\n')
}

module.exports = string =>
  marked(sanitizeString(string), {
    renderer: CustomRenderer(),
    smartypants: true
  })
