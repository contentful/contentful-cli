/* 
    should create concept if doesn't exist
        ensure we check relations too
    
    should create concept-scheme if doesn't exist
        also check top concepts
    
    should update concept if already exists
        ensure we check relations too
    
    should update concept-scheme if already exists
        also check top concepts
*/

import nixt from 'nixt'
import { join } from 'path'
const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

type Result = {
  stderr: string
  stdout: string
}

const cmd = 'organization import'

describe('organization import', () => {
  test('should print help message', done => {
    app()
      .run(`${cmd} --help`)
      .code(0)
      .expect(result => {
        const text = result.stdout.trim()
        expect(text).toMatchSnapshot('organization import help data is correct')
      })
      .end(done)
  })

  test.only('should print help message when correct arguments are not provided', done => {
    app()
      .run(`${cmd}`)
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()

        expect(resultText).toContain('Usage: contentful organization import')
      })
      .end(done)
  })
})
