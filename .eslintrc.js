module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['jest', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    jest: true,
    node: true,
    es6: true
  },
  rules: {
    'prettier/prettier': ['error'],
    'require-atomic-updates': ['warn']
  },
  overrides: [
    {
      files: ['**.test.js'],
      rules: {
        'no-unused-expressions': 'off'
      }
    }
  ]
}
