
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig({
  rules: {
    "no-unused-vars": 1,
    "@typescript-eslint/no-unused-vars": "error"
  },
},

  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
);