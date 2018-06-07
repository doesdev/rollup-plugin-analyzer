'use strict'

// setup
import test from 'ava'
import { resolve, join } from 'path'
import { rollup as rollupLatest } from 'rollup'
import { rollup as rollup59 } from 'rollup59'
import { rollup as rollup55 } from 'rollup55'
import { rollup as rollup50 } from 'rollup50'
import { rollup as rollup45 } from 'rollup45'
import { rollup as rollup40 } from 'rollup40'
import { analyze, formatted } from './../index'
const fixtures = resolve(__dirname, 'fixtures')
const baseOpts = {
  input: join(fixtures, 'bundle.js'),
  output: {format: 'cjs'}
}
const oldOpts = {
  entry: join(fixtures, 'bundle.js'),
  format: 'cjs'
}

// test against many versions of rollup
const rollers = [
  {rollup: rollupLatest, version: 'latest', opts: baseOpts},
  {rollup: rollup59, version: '0.59.x', opts: baseOpts},
  {rollup: rollup55, version: '0.55.x', opts: baseOpts},
  {rollup: rollup50, version: '0.50.x', opts: baseOpts},
  {rollup: rollup45, version: '0.45.x', opts: oldOpts},
  {rollup: rollup40, version: '0.40.x', opts: oldOpts}
]

// main
rollers.forEach(({rollup, version, opts}) => {
  test(`${version}: formatted returns string`, async (assert) => {
    let bundle = await rollup(opts)
    let results = await formatted(bundle)
    assert.is(typeof results, 'string')
  })

  test(`${version}: analyze returns array`, async (assert) => {
    let bundle = await rollup(opts)
    let results = await analyze(bundle)
    assert.true(Array.isArray(results))
  })

  test(`${version}: analysis child objects have expected properties`, async (assert) => {
    let bundle = await rollup(opts)
    let result = (await analyze(bundle))[0]
    assert.true('id' in result)
    assert.true('size' in result)
    assert.true('dependents' in result)
    assert.true('percent' in result)
  })

  test(`${version}: limit works`, async (assert) => {
    let bundle = await rollup(opts)
    assert.is((await analyze(bundle, {limit: 0})).length, 0)
    assert.is((await analyze(bundle, {limit: 1})).length, 1)
    assert.is((await analyze(bundle, {limit: 0})).length, 0)
  })

  test(`${version}: filter with array works`, async (assert) => {
    let bundle = await rollup(opts)
    assert.is((await analyze(bundle, {filter: ['jimmy', 'jerry']})).length, 0)
    assert.is((await analyze(bundle, {filter: ['import-a', 'jessie']})).length, 1)
  })

  test(`${version}: filter with string works`, async (assert) => {
    let bundle = await rollup(opts)
    assert.is((await analyze(bundle, {filter: 'jimmy'})).length, 0)
    assert.is((await analyze(bundle, {filter: 'import-b'})).length, 1)
  })

  test(`${version}: root works as expected`, async (assert) => {
    let bundle = await rollup(opts)
    assert.not(
      join(__dirname, (await analyze(bundle, {root: 'fakepath'}))[0].id),
      resolve(fixtures, 'import-a.js')
    )
    assert.is(
      join(__dirname, (await analyze(bundle, {root: __dirname}))[0].id),
      resolve(fixtures, 'import-a.js')
    )
  })

  test.failing(`${version}: tree shaking is accounted for`, async (assert) => {
    let bundle = await rollup(opts)
    let results = await analyze(bundle)
    let imported = results.find((r) => r.id.match('importme'))
    assert.is(imported.size, 4)
  })
})
