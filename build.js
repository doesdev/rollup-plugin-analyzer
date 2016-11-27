'use strict'

// Setup
const rollup = require('rollup').rollup
const dest = 'index.js'
const git = require('simple-git')(__dirname)

// Main
rollup({entry: 'index-es6.js'}).then((b) => {
  b.write({format: 'cjs', dest}).then(() => {
    git.add(['index.js'])
  }).catch(console.error)
})
