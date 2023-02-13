module.exports = {
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  },
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  transformIgnorePatterns: ['node_modules/(?!(.+))'],
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
  // Use this to set env variables for local development
  setupFiles: ['<rootDir>/.jest/env.js']
}
