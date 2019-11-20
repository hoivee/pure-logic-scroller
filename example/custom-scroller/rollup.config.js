// rollup.config.js
import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: path.resolve(__dirname, './index.js'),
  output: {
    file: path.resolve(__dirname, './dist/index.js'),
    format: 'umd',
    name: 'CustomScroller',
  },
  plugins: [
    resolve(),
    babel({
      plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-external-helpers'],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {browsers: '> 0.25%, ie 8, not dead'}
          }
        ]
      ]
    })
  ],
}
