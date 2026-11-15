const js = require('@eslint/js');
const globals = require('globals');
const ts = require('@typescript-eslint/eslint-plugin');
const imports = require('eslint-plugin-import');
const files = ['**/*.ts', '**/*.tsx'];

module.exports = [
  { ignores: ['node_modules/**', '.vite/**', 'out/**', 'dist/**', 'coverage/**'] },
  { files, rules: js.configs.recommended.rules },
  ...ts.configs['flat/recommended'].map(config => ({ ...config, files })),
  { ...imports.flatConfigs.recommended, files },
  { ...imports.flatConfigs.typescript, files },
  {
    files,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    settings: imports.configs.electron.settings,
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
