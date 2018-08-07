import nixt from 'nixt'
import { join } from 'path'

const bin = join(__dirname, './../../../../', 'bin')

// eslint-disable-next-line
const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

test.skip('TODO: should successfully export space')
