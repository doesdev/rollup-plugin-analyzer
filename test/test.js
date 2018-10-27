'use strict'

import test from 'ava'
import { promises as fs, constants as fsConst } from 'fs'
import { analyze, formatted, plugin } from './../index'
import { resolve as resolvePath, join, basename } from 'path'
import { rollup as rollupLatest } from 'rollup'
import { rollup as rollup60 } from 'rollup60'
import { rollup as rollup55 } from 'rollup55'
import { rollup as rollup50 } from 'rollup50'
import { rollup as rollup45 } from 'rollup45'
import { rollup as rollup40 } from 'rollup40'
const skipFormatted = true
const fixtures = resolvePath(__dirname, 'fixtures')
const baseOpts = {
  input: join(fixtures, 'bundle-a.js'),
  output: { format: 'cjs' }
}
const oldOpts = {
  entry: join(fixtures, 'bundle-a.js'),
  format: 'cjs'
}
const multiInputOpts = {
  input: [join(fixtures, 'bundle-a.js'), join(fixtures, 'bundle-b.js')],
  output: { format: 'cjs', dir: join(fixtures, 'multi') }
}
const expectHeader = `
-----------------------------
Rollup File Analysis
-----------------------------
`.trim()
const headerLength = expectHeader.length

// test against many versions of rollup
const rollers = [
  { rollup: rollupLatest, version: 'latest', opts: baseOpts },
  { rollup: rollup60, version: '0.60.x', opts: baseOpts },
  { rollup: rollup55, version: '0.55.x', opts: baseOpts, noTreeshake: true },
  { rollup: rollup50, version: '0.50.x', opts: baseOpts, noTreeshake: true },
  { rollup: rollup45, version: '0.45.x', opts: oldOpts, noTreeshake: true },
  { rollup: rollup40, version: '0.40.x', opts: oldOpts, noTreeshake: true }
]

// main
rollers.forEach(({ rollup, version, opts, noTreeshake }) => {
  test(`${version}: formatted returns expected string`, async (assert) => {
    let bundle = await rollup(opts)
    let results = await formatted(bundle)
    assert.is(results.substr(0, headerLength), expectHeader)
  })

  test(`${version}: analyze.modules returns array`, async (assert) => {
    let bundle = await rollup(opts)
    let results = await analyze(bundle)
    assert.true(Array.isArray(results.modules))
  })

  test(`${version}: analysis object has expected properties`, async (assert) => {
    let bundle = await rollup(opts)
    let result = await analyze(bundle)
    assert.true('bundleSize' in result)
    assert.true('bundleOrigSize' in result)
    assert.true('bundleReduction' in result)
    assert.true('modules' in result)
    let firstModule = result.modules[0]
    assert.true('id' in firstModule)
    assert.true('size' in firstModule)
    assert.true('dependents' in firstModule)
    assert.true('percent' in firstModule)
  })

  test(`${version}: limit works`, async (assert) => {
    let bundle = await rollup(opts)
    assert.is((await analyze(bundle, { limit: 0 })).modules.length, 0)
    assert.is((await analyze(bundle, { limit: 1 })).modules.length, 1)
    assert.is((await analyze(bundle, { limit: 0 })).modules.length, 0)
  })

  test(`${version}: filter with array works`, async (assert) => {
    let bundle = await rollup(opts)
    assert.is(
      (await analyze(bundle, { filter: ['jimmy', 'jerry'] })).modules.length,
      0
    )
    assert.is(
      (await analyze(bundle, { filter: ['import-a', 'jessie'] })).modules.length,
      1
    )
  })

  test(`${version}: filter with string works`, async (assert) => {
    let bundle = await rollup(opts)
    assert.is((await analyze(bundle, { filter: 'jimmy' })).modules.length, 0)
    assert.is((await analyze(bundle, { filter: 'import-b' })).modules.length, 1)
  })

  test(`${version}: filter with callback works`, async (assert) => {
    let bundle = await rollup(opts)
    let noMatch = (m) => m.id.indexOf('jimmy') !== -1
    let hasMatch = (m) => m.id.indexOf('import-b') !== -1
    assert.is((await analyze(bundle, { filter: noMatch })).modules.length, 0)
    assert.is((await analyze(bundle, { filter: hasMatch })).modules.length, 1)
  })

  test(`${version}: transformModuleId works`, async (assert) => {
    let bundle = await rollup(opts)
    let transformModuleId = (id) => `transformed-${basename(id)}`
    let expect = `transformed-import-a.js`
    let modules = (await analyze(bundle, { transformModuleId })).modules
    let firstModule = basename(modules[0].id)
    assert.is(firstModule, expect)
  })

  test(`${version}: root works as expected`, async (assert) => {
    let bundle = await rollup(opts)
    assert.not(
      join(__dirname, (await analyze(bundle, { root: 'fakepath' })).modules[0].id),
      resolvePath(fixtures, 'import-a.js')
    )
    assert.is(
      join(__dirname, (await analyze(bundle, { root: __dirname })).modules[0].id),
      resolvePath(fixtures, 'import-a.js')
    )
  })

  test(`${version}: it works with generated bundle as well`, async (assert) => {
    let bundle = await rollup(opts)
    await bundle.generate({ format: 'cjs' })
    let results = await formatted(bundle)
    assert.is(typeof results, 'string')
  })

  test(`${version}: plugin writes expected heading content`, async (assert) => {
    let results
    let writeTo = (r) => { results = r }
    let showExports = true
    let rollOpts = Object.assign(
      { plugins: [plugin({ writeTo, showExports })] },
      opts
    )
    let bundle = await rollup(rollOpts)
    await bundle.generate({ format: 'cjs' })
    assert.is(results.substr(0, expectHeader.length), expectHeader)
  })

  test(`${version}: htmlReportPath produces report`, async (assert) => {
    let htmlReportPath = resolvePath(__dirname, 'fixtures', 'report.html')
    try {
      await fs.unlink(htmlReportPath)
    } catch (ex) {}

    let writeTo = () => {}
    let onHtmlReport = (err, fp) => { if (err) throw err }
    let plugins = [plugin({ htmlReportPath, onHtmlReport, writeTo })]
    let rollOpts = Object.assign({ plugins }, opts)
    let bundle = await rollup(rollOpts)
    await bundle.generate({ format: 'cjs' })
    await fs.access(htmlReportPath, fsConst.F_OK)
    // if we made it here it didn't throw, we're good
    assert.true(true)
  })

  if (!noTreeshake) {
    test(`${version}: tree shaking is accounted for`, async (assert) => {
      let results
      let onAnalysis = (r) => { results = r.modules }
      let plugins = [plugin({ onAnalysis, skipFormatted })]
      let rollOpts = Object.assign({}, opts, { plugins })
      let bundle = await rollup(rollOpts)
      let output = { file: join(fixtures, 'output.js'), format: 'cjs' }
      await bundle.write(output)
      let imported = results.find((r) => r.id.indexOf('import-a') !== -1)
      let expectSize = 27
      assert.true(Math.abs(imported.size - expectSize) < 5)
    })

    test(`${version}: treeshaken bundle filters with callback`, async (assert) => {
      let results
      let filter = (m) => m.size > 2000
      let onAnalysis = (r) => { results = r.modules }
      let plugins = [plugin({ onAnalysis, filter, skipFormatted })]
      let rollOpts = Object.assign({}, opts, { plugins })
      let bundle = await rollup(rollOpts)
      let output = { file: join(fixtures, 'output.js'), format: 'cjs' }
      await bundle.write(output)
      assert.is(results.length, 1)
    })
  }

  if (version === '0.60.x') {
    let split1 = `${version}: writes expected heading with experimentalCodeSplitting`
    test(split1, async (assert) => {
      let results
      let writeTo = (r) => { results = r }
      let rollOpts = Object.assign(
        { plugins: [plugin({ writeTo })] },
        multiInputOpts
      )
      rollOpts.experimentalCodeSplitting = true
      let bundle = await rollup(rollOpts)
      await bundle.generate({ format: 'cjs' })
      assert.is(results.substr(0, expectHeader.length), expectHeader)
    })

    let split2 = `${version}: data as expected with experimentalCodeSplitting`
    test(split2, async (assert) => {
      let results = []
      let onAnalysis = (r) => { results.push(r.modules) }
      let plugins = [plugin({ onAnalysis, skipFormatted })]
      let rollOpts = Object.assign({}, multiInputOpts, { plugins })
      rollOpts.experimentalCodeSplitting = true
      let bundle = await rollup(rollOpts)
      await bundle.write(rollOpts.output)

      let imports = [{ id: 'import-a', size: 8238 }, { id: 'import-b', size: 33 }]
      imports.forEach((imp, i) => {
        let result = results[i]
        let imported = result.find((r) => r.id.indexOf(imp.id) !== -1)
        assert.true(Math.abs(imported.size - imp.size) < 5)
      })
    })

    test.failing(`${version}: callback is only invoked once`, async (assert) => {
      let count = 0
      let writeTo = () => ++count

      let rollOpts = Object.assign(
        { plugins: [plugin({ writeTo })] },
        multiInputOpts
      )
      rollOpts.experimentalCodeSplitting = true
      let bundle = await rollup(rollOpts)
      await bundle.generate({ format: 'cjs' })

      assert.is(count, 1)
    })
  }

  if (version === 'latest') {
    test(`${version}: plugin shouldn't cause much overhead`, async (assert) => {
      let start
      let runs = 20
      let msDiffThreshold = 50

      // bundle without plugin in use
      start = Date.now()
      for (let i = 0; i < runs; i++) {
        let bundle = await rollup(opts)
        await bundle.generate({ format: 'cjs' })
      }
      let noPlugin = (Date.now() - start) / runs

      // now with the plugin
      let count = 0
      let writeTo = (r) => ++count
      let rollOpts = Object.assign({ plugins: [plugin({ writeTo })] }, opts)
      start = Date.now()
      for (let i = 0; i < runs; i++) {
        let bundle = await rollup(rollOpts)
        await bundle.generate({ format: 'cjs' })
      }
      let withPlugin = (Date.now() - start) / runs

      assert.is(count, runs)
      assert.true((withPlugin - noPlugin) < msDiffThreshold)
    })
  }
})
