const js = require('@eslint/js')
const prettier = require('eslint-config-prettier')
const n = require('eslint-plugin-n')
const jest = require('eslint-plugin-jest')
const globals = require('globals')

module.exports = [
  {
    ignores: ['node_modules/**', 'src/test/coverage/**', 'coverage/**']
  },
  js.configs.recommended,
  n.configs['flat/recommended-script'],
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': ['error', { vars: 'all', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'n/no-missing-require': 'off',
      'n/no-unpublished-require': 'off'
    }
  },
  {
    files: ['src/test/**/*.js'],
    plugins: { jest },
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expectError'] }]
    }
  }
]
