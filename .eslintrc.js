module.exports = {
  'extends': 'standard',
  'plugins': [
    'standard',
    'promise'
  ],
  'overrides': [
    {
      'files': ['**.test.js'],
      'rules': {
        'no-unused-expressions': 'off'
      }
    }
  ],
  'globals': {
    'test': true,
    'expect': true,
    'afterAll': true,
    'beforeAll': true,
    'afterEach': true,
    'beforeEach': true
  }
}
