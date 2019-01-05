'use strict'

import analyzer from './module'

export default {
  plugins: [analyzer()],
  input: 'module.js',
  output: {
    file: 'index.js',
    format: 'cjs'
  }
}
