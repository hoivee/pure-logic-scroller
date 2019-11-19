module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.eslint.json",
  },
  "extends": [
    "standard-with-typescript",
  ],
  "plugins": [
    "import",
    "@typescript-eslint"
  ]
}
