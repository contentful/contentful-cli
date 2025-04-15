module.exports = {
  testTimeout: 15000,
  transform: {
    '.[jt]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  transformIgnorePatterns: ['node_modules/(?!(.+))'],
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
  // Use this to set env variables for local development
  setupFiles: ['<rootDir>/.jest/env.js'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'jest-junit-results.xml',
        addFileAttribute: true
      }
    ]
  ]
}
