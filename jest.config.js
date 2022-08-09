module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  transformIgnorePatterns: ['node_modules/(?!(.+))']
  // Use this to set env variables for local development
  // setupFiles: ['<rootDir>/.jest/env.js']
}
