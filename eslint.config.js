import js from '@eslint/js'

import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import namingSuffixRule from './eslint-rules/naming-suffix.js'

export default tseslint.config(
  { ignores: ['dist', 'vite.config.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'local-naming': {
        rules: {
          'naming-suffix': namingSuffixRule,
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/no-unescaped-entities': 'off',
      'import/no-anonymous-default-export': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'off',
      'no-duplicate-imports': 'error',
      // ห้ามใช้ any โดยเด็ดขาด
      '@typescript-eslint/no-explicit-any': 'error',
      // ห้ามใช้ unknown ทั้งโปรเจกต์
      '@typescript-eslint/no-restricted-types': [
        'error',
        { types: { unknown: { message: 'ห้ามใช้ unknown ให้ใช้ type ที่เจาะจงแทน' } } },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      // ห้าม cast ด้วย as / angle-bracket
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      // ห้าม import type / import { type ... } ให้ใช้ import ... from ...
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }],
      // ห้ามใช้ชื่อตัวแปรแบบย่อ (อย่างน้อย 2 ตัวอักษร, ยกเว้น loop index และ unused)
      'id-length': ['error', { min: 2, properties: 'never', exceptions: ['i', 'j', 'k', '_'] }],
      // ห้ามใช้ eslint-disable comments
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program > :matches(ExpressionStatement, BlockStatement) > :matches(Literal[value=/eslint-disable/], Comment[value=/eslint-disable/])',
          message: 'ห้ามใช้ eslint-disable ให้แก้ type errors แทน',
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'local-naming/naming-suffix': 'error',
    },
  },
  {
    files: ['src/core/endpoints/parseJson.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
)
