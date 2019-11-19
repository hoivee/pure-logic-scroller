// rollup.config.js
import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import { eslint } from "rollup-plugin-eslint"
const version = process.env.VERSION || require('./package.json').version
export default {
  input: path.resolve(__dirname, './src/index.ts'),
  output: [
    {
      file: path.resolve(__dirname, './dist/index.es.js'),
      format: 'es',
      name: 'scroller',
    },
    {
      file: path.resolve(__dirname, './dist/index.js'),
      format: 'umd',
      name: 'scroller',
    },
  ],
  banner:''+
    '/*!\n' +
    ` * scroller.js v${version}\n` +
    ` * (c) 2019-${new Date().getFullYear()} hoivee\n` +
    ' * Released under the MIT License.\n' +
    ' */',
  sourcemap:'inline',
  plugins: [
    eslint(),
    typescript({
      useTsconfigDeclarationDir: true
    })
  ],
}

