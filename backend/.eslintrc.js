// Sample .eslintrc.js

module.exports = {
    parser: 'babel-eslint', //default parser
    parserOptions: {
        ecmaVersion: 10,
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        jest: true,
    },
    plugins: ['prettier'],
    extends: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
    },
}
