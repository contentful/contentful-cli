module.exports = {
  // See https://github.com/facebook/jest/issues/12270
  moduleNameMapper: {
    '#(.*)': '<rootDir>/node_modules/$1'
  },
  rootDir: '.',
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  transform: {
    '\\.(mjs|js)$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(.+))']
}
