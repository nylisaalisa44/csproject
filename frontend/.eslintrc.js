module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
  },
  extends: [
    'prettier',
    'plugin:vue/base',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'vue/multi-word-component-names': 0,
    'vue/no-v-text-v-html-on-component': 0,
    'func-call-spacing': 'off',
  },
}
