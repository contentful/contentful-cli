import { tmpdir } from 'os'
import { join } from 'path'
process.env.CONTENTFUL_CONFIG_FILE = join(tmpdir(), '.contentfulrc.json')
