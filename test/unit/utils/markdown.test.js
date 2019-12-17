const markdown = require('../../../lib/utils/markdown')

test('headings are rendered in terminal', function() {
  const md = `
# H1
## H2

Alt-H1
======
Alt-H2
------
  `

  const res = markdown(md)
  expect(res).toBe(`
H1

H2


Alt-H1

Alt-H2

`)
})

test('urls are rendered in terminal', function() {
  const md = `
[I'm an inline-style link](https://www.google.com)
http://www.example.com
  `

  const res = markdown(md)
  expect(res).toBe(`I’m an inline-style link (https://www.google.com)
http://www.example.com

`)
})

test('inline code is rendered in terminal', function() {
  const inlineCode = `
Inline \`code\` has \`back-ticks around\` it.
  `

  const res = markdown(inlineCode)
  expect(res).toContain(`Inline code has back-ticks around it.`)
})

test('code blocks are rendered in terminal', function() {
  const inlineCode = `
\`\`\`python
s = "Python syntax highlighting"
print s
\`\`\`

\`\`\`
No language indicated, so no syntax highlighting.
But let's throw in a <b>tag</b>.
\`\`\`

Install the project using:\n\n\`\`\`shell\nnpm install\`\`\`\n\nRun the project using:\n\n\`\`\`shell\nnpm start\`\`\`\n
`

  const res = markdown(inlineCode)
  expect(res).toBe(`python
s = "Python syntax highlighting"
print s

No language indicated, so no syntax highlighting.
But let's throw in a <b>tag</b>.

Install the project using:

shell
npm install

Run the project using:

shell
npm start

`)
})
