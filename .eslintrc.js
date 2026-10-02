module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['jest', 'prettier', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
    node: true,
    es6: true
  },
  rules: {
    'prettier/prettier': ['error'],
    'require-atomic-updates': ['warn'],
    '@typescript-eslint/no-var-requires': ['warn'],
    '@typescript-eslint/ban-ts-comment': ['warn']
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
