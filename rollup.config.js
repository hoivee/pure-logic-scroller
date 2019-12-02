// rollup.config.js
import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import { eslint } from "rollup-plugin-eslint"
const version = require('./package.json').version
const banner = ''+
'/*!\n' +
` * pure-logic-scroller.js v${version}\n` +
` * (c) 2019-${new Date().getFullYear()} hoivee\n` +
' * Released under the MIT License.\n' +
' */'
export default {
  input: path.resolve(__dirname, './src/index.ts'),
  output: [
    {
      file: path.resolve(__dirname, './dist/index.es.js'),
      format: 'es',
      banner,
      name: 'scroller',
    },
    {
      file: path.resolve(__dirname, './dist/index.js'),
      banner,
      format: 'umd',
      name: 'scroller',
    },
  ],
  plugins: [
    eslint(),
    typescript({
      useTsconfigDeclarationDir: true
    })
  ],
}

