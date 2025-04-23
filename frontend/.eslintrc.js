module.exports = {
  root: true,
  // Disable most rules to avoid dependency issues
  extends: [],
  rules: {},
  // Override default parser options to avoid needing plugins
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  // Empty settings to avoid needing react plugin
  settings: {}
}; 