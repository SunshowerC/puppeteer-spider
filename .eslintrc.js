module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['@finance/loan/typescript'],
  rules: {
    'no-useless-constructor': 'off',
    'no-empty-function': ['error', { allow: ['constructors'] }],
    "no-await-in-loop": 'off',
    'no-loop-func': 'off',
    "no-undef": 'off'

  }
}
