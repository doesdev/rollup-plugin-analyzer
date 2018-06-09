'use strict'

import { plugin } from './module'

export default {
  plugins: [plugin()],
  input: 'module.js',
  output: {
    file: 'index.js',
    format: 'cjs'
  }
}
