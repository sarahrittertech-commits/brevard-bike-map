// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Plain Node scripts, not app code.
    files: ['scripts/**/*.cjs'],
    languageOptions: {
      globals: { __dirname: 'readonly', require: 'readonly', module: 'readonly', process: 'readonly', console: 'readonly' },
    },
  },
]);
