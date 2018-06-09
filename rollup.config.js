'use strict'

import { plugin } from './module'
const limitBytes = 1e6

const onAnalysis = ({bundleSize}) => {
  if (bundleSize < limitBytes) return
  console.log(`Bundle size exceeds ${limitBytes} bytes: ${bundleSize} bytes`)
  return process.exit(1)
}

export default {
  plugins: [plugin({onAnalysis})],
  input: 'module.js',
  output: {
    file: 'index.js',
    format: 'cjs'
  }
}
