'use strict'

import analyzer from './../../module'

export default {
  plugins: [analyzer(), analyzer({ summaryOnly: true })],
  input: 'bundle-a.js',
  output: {
    file: 'output.js',
    format: 'cjs'
  }
}
