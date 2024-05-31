import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  {
    rules: {
      'comma-dangle': 'off',
      'space-before-function-paren': 'off',
      'no-unused-vars': [
        'error',
        {
          args: 'none',
        },
      ],
    },
  },
]
