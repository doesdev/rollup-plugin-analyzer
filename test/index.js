'use strict'

// setup
import test from 'ava'
import { resolve, join } from 'path'
import { rollup } from 'rollup'
// import { rollup as rollup59 } from 'rollup59'
import analyzer, { init, formatted, analyze } from './../index'
const fixtures = resolve(__dirname, 'fixtures')
const baseOpts = {
  input: join(fixtures, 'bundle.js'),
  output: {format: 'cjs'}
}

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
  let bundle = await rollup(baseOpts)
  let results = await formatted(bundle)
  assert.is(typeof results, 'string')
})

test(`analyze returns array`, async (assert) => {
  let bundle = await rollup(baseOpts)
  let results = await analyze(bundle)
  assert.true(Array.isArray(results))
})

test(`analysis child objects have expected properties`, async (assert) => {
  let bundle = await rollup(baseOpts)
  let result = (await analyze(bundle))[0]
  assert.true('id' in result)
  assert.true('size' in result)
  assert.true('dependents' in result)
  assert.true('percent' in result)
})

test(`limit works and opts are set the same via init or analyzer`, async (assert) => {
  let bundle = await rollup(baseOpts)
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
  let bundle = await rollup(baseOpts)
  init({filter: ['jimmy', 'jerry']})
  assert.is((await analyze(bundle)).length, 0)
  init({filter: ['import-a', 'jessie']})
  assert.is((await analyze(bundle)).length, 1)
  init({filter: undefined})
})

test(`filter with string works`, async (assert) => {
  let bundle = await rollup(baseOpts)
  init({filter: 'jimmy'})
  assert.is((await analyze(bundle)).length, 0)
  init({filter: 'import-b'})
  assert.is((await analyze(bundle)).length, 1)
  init({filter: undefined})
})

test(`root works as expected`, async (assert) => {
  let bundle = await rollup(baseOpts)
  init({root: 'fakepath'})
  assert.not(
    join(__dirname, (await analyze(bundle))[0].id),
    resolve(fixtures, 'import-a.js')
  )
  init({root: __dirname})
  assert.is(
    join(__dirname, (await analyze(bundle))[0].id),
    resolve(fixtures, 'import-a.js')
  )
  init({root: undefined})
})

test.failing(`tree shaking is accounted for`, async (assert) => {
  let bundle = await rollup(baseOpts)
  let results = await analyze(bundle)
  let imported = results.find((r) => r.id.match('importme'))
  assert.is(imported.size, 4)
})
