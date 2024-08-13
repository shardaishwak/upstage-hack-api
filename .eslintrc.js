module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier', // Make sure this is always the last element in the array.
      'plugin:prettier/recommended'
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
      'prettier/prettier': 'error'
    }
  };
  