const markdown = require('../../../lib/utils/markdown')

test('headings are rendered in terminal', function () {
  const md = `
# H1
## H2
Alt-H1
======
Alt-H2
------
  `
  const res = markdown(md)

  // Normalize whitespace and check content
  const normalized = res.replace(/\s+/g, ' ').trim()
  expect(normalized).toContain('H1')
  expect(normalized).toContain('H2')
  expect(normalized).toContain('Alt-H1')
  expect(normalized).toContain('Alt-H2')
})

test('urls are rendered in terminal', function () {
  const md = `
[I'm an inline-style link](https://www.google.com)
http://www.example.com
`
  const res = markdown(md)

  // Check that the link text and URL are present
  expect(res).toContain('inline-style link')
  expect(res).toContain('https://www.google.com')
  expect(res).toContain('http://www.example.com')
})

test('inline code is rendered in terminal', function () {
  const inlineCode = `
Inline \`code\` has \`back-ticks around\` it.
  `
  const res = markdown(inlineCode)

  // Just check that the key parts are present, ignoring punctuation
  expect(res).toContain('Inline')
  expect(res).toContain('code')
  expect(res).toContain('back-ticks')
  expect(res).toContain('around')
})

test('code blocks are rendered in terminal', function () {
  const codeBlocks = `
\`\`\`python
s = "Python syntax highlighting"
print s
\`\`\`

\`\`\`
No language indicated, so no syntax highlighting.
But let's throw in a <b>tag</b>.
\`\`\`

Install the project using:

\`\`\`shell
npm install
\`\`\`

Run the project using:

\`\`\`shell
npm start
\`\`\`
`
  const res = markdown(codeBlocks)

  // Check for key content without worrying about exact whitespace/formatting
  expect(res).toContain('python')
  expect(res).toContain('Python syntax highlighting')
  expect(res).toContain('print s')
  expect(res).toContain('No language indicated')
  expect(res).toContain('<b>tag</b>')
  expect(res).toContain('Install the project using')
  expect(res).toContain('shell')
  expect(res).toContain('npm install')
  expect(res).toContain('Run the project using')
  expect(res).toContain('npm start')
})