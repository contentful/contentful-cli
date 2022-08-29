import { tmpdir } from 'os'
process.env.CONTENTFUL_CONFIG_FILE = `${tmpdir()}/.contentfulrc.json`
