'use strict'

// how meta
import plugin from 'rollup-analyzer-plugin'
export default {
  entry: 'module.js',
  dest: 'index.js',
  format: 'cjs',
  plugins: [plugin()]
}
