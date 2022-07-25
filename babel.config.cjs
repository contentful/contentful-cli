module.exports = {
  presets: [
    ['@babel/preset-env', { modules: 'commonjs', targets: { node: 'current' } }]
  ],
  plugins: ['@babel/plugin-syntax-import-assertions']
}
