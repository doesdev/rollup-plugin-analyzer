'use strict'

const test = require('mvt')
const { analyze, formatted, plugin } = require('./../index')
const { resolve: resolvePath, join, basename } = require('path')
const { rollup: rollupLatest } = require('rollup')
const { rollup: rollup60 } = require('rollup60')
const { rollup: rollup100 } = require('rollup100')

const skipFormatted = true
const fixtures = resolvePath(__dirname, 'fixtures')
const importA = 'the-declaration-of-independence'
const importB = 'the-alphabet-but-incomplete'

const baseOpts = {
  input: join(fixtures, 'bundle-a.js'),
  output: { format: 'cjs' }
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
  { rollup: rollup100, version: '1.0.x', opts: baseOpts }
]

test('require signature works destructured, direct, and as .default', (assert) => {
  const { plugin: destructured } = require('./../index')
  const direct = require('./../index')
  assert.true(typeof destructured === 'function')
  assert.true(typeof direct === 'function')
  assert.true(typeof direct.default === 'function')
})

// main
rollers.forEach(({ rollup, version, opts, noTreeshake }) => {
  test(`${version}: formatted returns expected string`, async (assert) => {
    const bundle = await rollup(opts)
    const results = await formatted(bundle)
    assert.is(results.substr(0, headerLength), expectHeader)
  })

  test(`${version}: analyze.modules returns array`, async (assert) => {
    const bundle = await rollup(opts)
    const results = await analyze(bundle)
    assert.truthy(Array.isArray(results.modules))
  })

  test(`${version}: analysis object has expected properties`, async (assert) => {
    const bundle = await rollup(opts)
    const result = await analyze(bundle)
    assert.truthy('bundleSize' in result)
    assert.truthy('bundleOrigSize' in result)
    assert.truthy('bundleReduction' in result)
    assert.truthy('modules' in result)
    const firstModule = result.modules[0]
    assert.truthy('id' in firstModule)
    assert.truthy('size' in firstModule)
    assert.truthy('dependents' in firstModule)
    assert.truthy('percent' in firstModule)
  })

  test(`${version}: limit works`, async (assert) => {
    const bundle = await rollup(opts)
    assert.is((await analyze(bundle, { limit: 0 })).modules.length, 0)
    assert.is((await analyze(bundle, { limit: 1 })).modules.length, 1)
    assert.is((await analyze(bundle, { limit: 0 })).modules.length, 0)
  })

  test(`${version}: filter with array works`, async (assert) => {
    const bundle = await rollup(opts)
    assert.is(
      (await analyze(bundle, { filter: ['jimmy', 'jerry'] })).modules.length,
      0
    )
    assert.is(
      (await analyze(bundle, { filter: [importA, 'jessie'] })).modules.length,
      1
    )
  })

  test(`${version}: filter with string works`, async (assert) => {
    const bundle = await rollup(opts)
    assert.is((await analyze(bundle, { filter: 'jimmy' })).modules.length, 0)
    assert.is((await analyze(bundle, { filter: importB })).modules.length, 1)
  })

  test(`${version}: filter with callback works`, async (assert) => {
    const bundle = await rollup(opts)
    const noMatch = (m) => m.id.indexOf('jimmy') !== -1
    const hasMatch = (m) => m.id.indexOf(importB) !== -1
    assert.is((await analyze(bundle, { filter: noMatch })).modules.length, 0)
    assert.is((await analyze(bundle, { filter: hasMatch })).modules.length, 1)
  })

  test(`${version}: transformModuleId works`, async (assert) => {
    const bundle = await rollup(opts)
    const transformModuleId = (id) => `transformed-${basename(id)}`
    const expect = `transformed-${importA}.js`
    const modules = (await analyze(bundle, { transformModuleId })).modules
    const firstModule = basename(modules[0].id)
    assert.is(firstModule, expect)
  })

  test(`${version}: root works as expected`, async (assert) => {
    const bundle = await rollup(opts)
    assert.not(
      join(__dirname, (await analyze(bundle, { root: 'fakepath' })).modules[0].id),
      resolvePath(fixtures, `${importA}.js`)
    )
    assert.is(
      join(__dirname, (await analyze(bundle, { root: __dirname })).modules[0].id),
      resolvePath(fixtures, `${importA}.js`)
    )
  })

  test(`${version}: it works with generated bundle as well`, async (assert) => {
    const bundle = await rollup(opts)
    await bundle.generate({ format: 'cjs' })
    const results = await formatted(bundle)
    assert.is(typeof results, 'string')
  })

  test(`${version}: plugin writes expected heading content`, async (assert) => {
    let results
    const writeTo = (r) => { results = r }
    const showExports = true
    const rollOpts = Object.assign(
      { plugins: [plugin({ writeTo, showExports })] },
      opts
    )
    const bundle = await rollup(rollOpts)
    await bundle.generate({ format: 'cjs' })
    assert.is(results.substr(0, expectHeader.length), expectHeader)
  })

  test(`${version}: summaryOnly bar graphs as expected`, async (assert) => {
    let results
    const writeTo = (r) => { results = r }
    const rollOpts = Object.assign(
      { plugins: [plugin({ writeTo, summaryOnly: true, root: fixtures })] },
      opts
    )
    const bundle = await rollup(rollOpts)
    await bundle.generate({ format: 'cjs' })

    const bars = results.split('\n').filter((t) => {
      return t.indexOf('\u2591') !== -1 || t.indexOf('\u2588') !== -1
    }).map((t) => t.split(' ')[0])

    const barLengths = bars.map((t) => t.trim().length)

    assert.deepEqual(barLengths, bars.map(() => 50))
  })

  test(`${version}: tree shaking is accounted for`, async (assert) => {
    let results
    const onAnalysis = (r) => { results = r.modules }
    const plugins = [plugin({ onAnalysis, skipFormatted })]
    const rollOpts = Object.assign({}, opts, { plugins })
    const bundle = await rollup(rollOpts)
    const output = { file: join(fixtures, 'output.js'), format: 'cjs' }
    await bundle.write(output)
    const imported = results.find((r) => r.id.indexOf(importA) !== -1)
    const expectSize = 27
    assert.truthy(Math.abs(imported.size - expectSize) < 5)
  })

  test(`${version}: treeshaken bundle filters with callback`, async (assert) => {
    let results
    const filter = (m) => m.size > 2000
    const onAnalysis = (r) => { results = r.modules }
    const plugins = [plugin({ onAnalysis, filter, skipFormatted })]
    const rollOpts = Object.assign({}, opts, { plugins })
    const bundle = await rollup(rollOpts)
    const output = { file: join(fixtures, 'output.js'), format: 'cjs' }
    await bundle.write(output)
    assert.is(results.length, 1)
  })

  if (version === '0.60.x') {
    const split1 = `${version}: writes expected heading with experimentalCodeSplitting`
    test(split1, async (assert) => {
      let results
      const writeTo = (r) => { results = r }
      const rollOpts = Object.assign(
        { plugins: [plugin({ writeTo })] },
        multiInputOpts
      )
      rollOpts.experimentalCodeSplitting = true
      const bundle = await rollup(rollOpts)
      await bundle.generate({ format: 'cjs' })
      assert.is(results.substr(0, expectHeader.length), expectHeader)
    })

    const split2 = `${version}: data as expected with experimentalCodeSplitting`
    test(split2, async (assert) => {
      const results = []
      const onAnalysis = (r) => { results.push(r.modules) }
      const plugins = [plugin({ onAnalysis, skipFormatted })]
      const rollOpts = Object.assign({}, multiInputOpts, { plugins })
      rollOpts.experimentalCodeSplitting = true
      const bundle = await rollup(rollOpts)
      await bundle.write(rollOpts.output)

      const imports = [{ id: importA, size: 8238 }, { id: importB, size: 33 }]
      imports.forEach((imp, i) => {
        const result = results[i]
        const imported = result.find((r) => r.id.indexOf(imp.id) !== -1)
        assert.truthy(Math.abs(imported.size - imp.size) < 5)
      })
    })

    test.failing(`${version}: callback is only invoked once`, async (assert) => {
      let count = 0
      const writeTo = () => ++count

      const rollOpts = Object.assign(
        { plugins: [plugin({ writeTo })] },
        multiInputOpts
      )
      rollOpts.experimentalCodeSplitting = true
      const bundle = await rollup(rollOpts)
      await bundle.generate({ format: 'cjs' })

      assert.is(count, 1)
    })
  }

  if (version === 'latest') {
    test(`${version}: plugin shouldn't cause much overhead`, async (assert) => {
      let start
      const runs = 20
      const msDiffThreshold = 50

      // bundle without plugin in use
      start = Date.now()
      for (let i = 0; i < runs; i++) {
        const bundle = await rollup(opts)
        await bundle.generate({ format: 'cjs' })
      }
      const noPlugin = (Date.now() - start) / runs

      // now with the plugin
      let count = 0
      const writeTo = (r) => ++count
      const rollOpts = Object.assign({ plugins: [plugin({ writeTo })] }, opts)
      start = Date.now()
      for (let i = 0; i < runs; i++) {
        const bundle = await rollup(rollOpts)
        await bundle.generate({ format: 'cjs' })
      }
      const withPlugin = (Date.now() - start) / runs

      assert.is(count, runs)
      assert.truthy((withPlugin - noPlugin) < msDiffThreshold)
    })
  }
})

test('rollup < 1.0.0 prints warning about support', async (assert) => {
  let results = ''
  const oldCslErr = console.error
  console.error = (...args) => {
    results += args.join()
  }
  const rollOpts = Object.assign({ plugins: [plugin()] }, baseOpts)
  const bundle = await rollup60(rollOpts)
  await bundle.generate({ format: 'cjs' })
  const expect = 'rollup-plugin-analyzer: Rollup version not supported'
  assert.is(results.split('\n')[0], expect)
  console.error = oldCslErr
})
