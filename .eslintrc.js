module.exports = {
  'extends': 'standard',
  'plugins': [
    'standard',
    'promise',
    'jest'
  ],
  'env': {
    'jest/globals': true
  },
  'overrides': [
    {
      'files': ['**.test.js'],
      'rules': {
        'no-unused-expressions': 'off'
      }
    }
  ]
}
