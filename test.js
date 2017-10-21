'use strict'

// setup
import test from 'ava'
import { rollup } from 'rollup'
import analyzer, { init, formatted, analyze } from './index'
const baseOpts = {
  input: 'module.js',
  output: {format: 'cjs'}
}
let bundle

// create the bundle
test.before(async () => {
  bundle = await rollup(baseOpts)
})

// main
test(`analyzer returns {init, formatted, analyze}`, (assert) => {
  assert.is(analyzer.init, init)
  assert.is(analyzer.formatted, formatted)
  assert.is(analyzer.analyze, analyze)
})

test(`analyzer() returns {init, formatted, analyze}`, (assert) => {
  let optedAnalyzer = analyzer()
  assert.is(optedAnalyzer.init, init)
  assert.is(optedAnalyzer.formatted, formatted)
  assert.is(optedAnalyzer.analyze, analyze)
})

test(`formatted returns string`, async (assert) => {
  let results = await formatted(bundle)
  assert.is(typeof results, 'string')
})

test(`analyze returns array`, async (assert) => {
  let results = await analyze(bundle)
  assert.true(Array.isArray(results))
})

test(`analysis child objects have expected properties`, async (assert) => {
  let result = (await analyze(bundle))[0]
  assert.true('id' in result)
  assert.true('size' in result)
  assert.true('dependents' in result)
  assert.true('percent' in result)
})

test(`limit works and opts are set the same via init or analyzer`, async (assert) => {
  init({limit: 0})
  assert.is((await analyze(bundle)).length, 0)
  init({limit: 1})
  assert.is((await analyze(bundle)).length, 1)
  analyzer({limit: 0})
  assert.is((await analyze(bundle)).length, 0)
  analyzer({limit: 1})
  assert.is((await analyze(bundle)).length, 1)
  init({limit: undefined})
})

test(`filter with array works`, async (assert) => {
  init({filter: ['jimmy', 'jerry']})
  assert.is((await analyze(bundle)).length, 0)
  init({filter: ['module', 'jessie']})
  assert.is((await analyze(bundle)).length, 1)
  init({filter: undefined})
})

test(`filter with string works`, async (assert) => {
  init({filter: 'jimmy'})
  assert.is((await analyze(bundle)).length, 0)
  init({filter: 'module'})
  assert.is((await analyze(bundle)).length, 1)
  init({filter: undefined})
})

test(`root works as expected`, async (assert) => {
  init({root: 'fakepath'})
  assert.not(
    (await analyze(bundle))[0].id.replace(/\\|\//g, ''),
    'module.js'
  )
  init({root: process.cwd()})
  assert.is(
    (await analyze(bundle))[0].id.replace(/\\|\//g, ''),
    'module.js'
  )
  init({root: undefined})
})
