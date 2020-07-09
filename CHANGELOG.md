### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

### [3.3.0](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.2.3...3.3.0)

> 8 July 2020

- Add `filterSummary` option (#19 && #20)
- Fix `origSize`, `bundleOrigSize`, and `bundleReduction` (was apparently borked)
- Remove Rollup 0.60.0 from tests
- Fix incorrect key names in `analysisObject` docs
- Clarify `filter` usage
- Update dev deps

### [3.2.3](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.2.2...3.2.3)

> 13 May 2020

- [Add TS declarations](https://github.com/doesdev/rollup-plugin-analyzer/pull/17)
- Update lockfile

### [3.2.2](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.2.1...3.2.2)

> 1 November 2019

- Hack: Coalesce bundleMods
- Update dev deps

### [3.2.1](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.2.0...3.2.1)

> 12 September 2019

- Explicitly add `.default` property to `plugin` in CJS output
- Because my previous unbreaking change broke things
- Clarify import and require usage in README

### [3.2.0](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.1.2...3.2.0)

> 12 September 2019

- [SHOULD NOT BE BREAKING] Correct export signature in module.js
  - This, while an API change, should not be a breaking change
  - Previously the export signature when used as a module was a bit effed
  - This should fix that
  - To my knowledge and in my tests that should not break things
- Update yarn lockfile using latest Rollup version
- Correct path to latest Rollup version under scripts
- Remove `changelog` script (manually maintain changelog, tis better this way)
- Add `engines` to package.json, Node >= 8
- Update dev dependencies (mvt, husky, standard)
- Fix some standard style issues

### [3.1.2](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.1.1...3.1.2)

> 14 July 2019

- Update dependencies
- Fix some standardjs issues
- Use mvt for testing instead of AVA

### [3.1.1](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.1.0...3.1.1)

> 7 July 2019

- Don't combine bar graph with id in summary

### [3.1.0](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.0.1...3.1.0)

> 6 July 2019

- Add bar graphs to formatted output
- Add `summaryOnly` option

### [3.0.1](https://github.com/doesdev/rollup-plugin-analyzer/compare/3.0.0...3.0.1)

> 1 June 2019

- Update dependencies

### [3.0.0](https://github.com/doesdev/rollup-plugin-analyzer/compare/2.1.0...3.0.0)

> 5 January 2019

- Add default export (fixes #6), warn on rollup < 1.0.0 [`#6`](https://github.com/doesdev/rollup-plugin-analyzer/issues/6)
- Remove support for rollup < 1.0.0, support 1.0.0 [`506d93f`](https://github.com/doesdev/rollup-plugin-analyzer/commit/506d93f942dce5e076312bd1642aed182fe12a60)
- Implement transformModuleId option [`a173a43`](https://github.com/doesdev/rollup-plugin-analyzer/commit/a173a43f9e6b7a5fee8c07274e7d43df7a6939db)
- Update Node versions to test in CI, drop 6 [`ee60a38`](https://github.com/doesdev/rollup-plugin-analyzer/commit/ee60a3868b946760560c71a0d594a32965073762)

#### [2.1.0](https://github.com/doesdev/rollup-plugin-analyzer/compare/2.0.4...2.1.0)

> 11 July 2018

- Let onAnalysis and formatted coexist, addresses #2 [`0bdc851`](https://github.com/doesdev/rollup-plugin-analyzer/commit/0bdc851dd66623584e4ac0f41636d0f30340a6e6)
- Don't swallows errors, as noted in #1 [`07f5c9a`](https://github.com/doesdev/rollup-plugin-analyzer/commit/07f5c9a15e58b49004df8aa65d757704d5959609)
- Add test to ensure plugin isn't adding overhead [`513bd8b`](https://github.com/doesdev/rollup-plugin-analyzer/commit/513bd8bb44388b9d09c15f79f0b09b1ffdf1cfb6)
- Add CONTRIBUTING.md [`77ed765`](https://github.com/doesdev/rollup-plugin-analyzer/commit/77ed7650e1140cf8bba89722b304ca00a0c7c804)
- Test that callback is only invoked once, failing [`8c6ac14`](https://github.com/doesdev/rollup-plugin-analyzer/commit/8c6ac148fdf74b5beadd7b6f8f17a847fb2572bd)
- Bump to 2.1.0 [`3fa544f`](https://github.com/doesdev/rollup-plugin-analyzer/commit/3fa544fd823b1fb38797b151a1485ab5c7c8e8c4)

#### [2.0.4](https://github.com/doesdev/rollup-plugin-analyzer/compare/2.0.3...2.0.4)

> 3 July 2018

- Update multi-out tests, failing, skipped [`8813ec7`](https://github.com/doesdev/rollup-plugin-analyzer/commit/8813ec7786825b1256c9af9331f55941e1ad718e)
- Handle bundles with multiple outputs, 2.0.4 [`12512c9`](https://github.com/doesdev/rollup-plugin-analyzer/commit/12512c9b2a7d2f2c61467b295add5286a79abae2)
- Test with experimentalCodeSplitting enabled as well [`fc54b1b`](https://github.com/doesdev/rollup-plugin-analyzer/commit/fc54b1be5ed8b360ce30cdf511f5671a8f974923)
- Fix module name in examples [`dafa44e`](https://github.com/doesdev/rollup-plugin-analyzer/commit/dafa44edb863d6e5d13953a11aa79e920d989158)

#### [2.0.3](https://github.com/doesdev/rollup-plugin-analyzer/compare/2.0.2...2.0.3)

> 9 June 2018

- Add showExports option, expose exports in analysis [`2be9c1c`](https://github.com/doesdev/rollup-plugin-analyzer/commit/2be9c1c9f82d7a01d3e638971b2127c363b9cfc9)
- Some cleanup and formatting tweaks [`e40789e`](https://github.com/doesdev/rollup-plugin-analyzer/commit/e40789eb1047d0ed04d30b5254a9373034453325)
- Add module count to formatted output [`e880a9d`](https://github.com/doesdev/rollup-plugin-analyzer/commit/e880a9d2fca46777199017abb83c133878c20c5b)
- Fix redundant imports in CI example [`a5328de`](https://github.com/doesdev/rollup-plugin-analyzer/commit/a5328de5c0fdc170c347f8e502b84fbb27886219)
- Include module count in example output [`86b0d55`](https://github.com/doesdev/rollup-plugin-analyzer/commit/86b0d55744e3502c58a53afde8c6e8f080965fe2)

#### [2.0.2](https://github.com/doesdev/rollup-plugin-analyzer/compare/2.0.1...2.0.2)

> 9 June 2018

- Add ability to filter with callback, 2.0.2 [`4a5f535`](https://github.com/doesdev/rollup-plugin-analyzer/commit/4a5f535b1cc5b2040747511be4d79aa63f7e9635)

#### [2.0.1](https://github.com/doesdev/rollup-plugin-analyzer/compare/2.0.0...2.0.1)

> 8 June 2018

- Use updated example output [`9795af7`](https://github.com/doesdev/rollup-plugin-analyzer/commit/9795af7a95d03b38aa43d4cef599724ea43cb3e1)

#### [2.0.0](https://github.com/doesdev/rollup-plugin-analyzer/compare/2.0.0-beta.1...2.0.0)

> 8 June 2018

- 2.0.0 [`#5`](https://github.com/doesdev/rollup-plugin-analyzer/pull/5)
- Beef up test fixtures [`8e5d30f`](https://github.com/doesdev/rollup-plugin-analyzer/commit/8e5d30f6c341e0adc70299ba3c880da48514ed7c)
- Epic commit, 97% moar awesomer [`ee6a7dd`](https://github.com/doesdev/rollup-plugin-analyzer/commit/ee6a7dd10c35876443c57bf8f68e3affa51a6802)
- Update from rollup-analyzer to rollup-plugin-analyzer [`675dcdc`](https://github.com/doesdev/rollup-plugin-analyzer/commit/675dcdc79cc009f4800971b9683473842deafe72)
- Rework analysis object API [`6f98a0b`](https://github.com/doesdev/rollup-plugin-analyzer/commit/6f98a0bbf69be452f2a38a92c4cd66a54efa7e15)
- Add overall code reduction metrics [`2023900`](https://github.com/doesdev/rollup-plugin-analyzer/commit/20239001e974ef6d981caf53b32051eb6b0ded3b)
- Formatting tweaks [`de2252a`](https://github.com/doesdev/rollup-plugin-analyzer/commit/de2252af1a49d73243883719cf49ad0d714344ca)
- Ensure we don't fallback if renderedLength === 0 [`7dc5b4e`](https://github.com/doesdev/rollup-plugin-analyzer/commit/7dc5b4e7da1539ad588b05f8329b2541756f30bc)
- Clamp percentages [`9dbbc79`](https://github.com/doesdev/rollup-plugin-analyzer/commit/9dbbc792a72fa047db017af181043f43d3c07e5d)
- Set root default again [`e0262a1`](https://github.com/doesdev/rollup-plugin-analyzer/commit/e0262a13c083f6a16d7693d78c5d0dc2f43cffb9)

#### [2.0.0-beta.1](https://github.com/doesdev/rollup-plugin-analyzer/compare/1.1.0...2.0.0-beta.1)

> 7 June 2018

- Switch to yarn with multiple rollup versions to test [`3cd30cc`](https://github.com/doesdev/rollup-plugin-analyzer/commit/3cd30cc40118401f988234d3f76e4c3f3023f84f)
- Update deps, add failing test for tree shaking [`9d26c38`](https://github.com/doesdev/rollup-plugin-analyzer/commit/9d26c388c347d130700004198032004375a0f6d8)
- Tests against many rollup versions >= 0.40.x [`b52c793`](https://github.com/doesdev/rollup-plugin-analyzer/commit/b52c793844e2217027caac01f63b273937bd8fd3)
- Start working on 2.0.0 [`46c03cb`](https://github.com/doesdev/rollup-plugin-analyzer/commit/46c03cb4f9b6577abf6745f11b29b41ccbfe55af)
- Reflect treeshaking, only in plugin currently [`1ddf5f7`](https://github.com/doesdev/rollup-plugin-analyzer/commit/1ddf5f72a0c65088cb9484b00b0b4163633f1b3d)
- Rework test file structure [`2767bfc`](https://github.com/doesdev/rollup-plugin-analyzer/commit/2767bfcf905bd9cf409b4e2ac1cedf40ea9b363e)
- Import from two files in test [`73e524b`](https://github.com/doesdev/rollup-plugin-analyzer/commit/73e524b00033221395bf9167ffe58a2d6ba3ad7e)
- Start updating API in readme [`6c78820`](https://github.com/doesdev/rollup-plugin-analyzer/commit/6c788207e9ed7eb981e1a72dac3eab655edd1ce9)
- Integrate plugin, add related (failing) test [`9b9c2ca`](https://github.com/doesdev/rollup-plugin-analyzer/commit/9b9c2ca173702f2b7dbb3d4924cbd0fabb5e5b60)
- Bundle with each test [`4f9f437`](https://github.com/doesdev/rollup-plugin-analyzer/commit/4f9f4370d615c0375ff97ce7376bbcb25f906e1d)
- Test that it works after bundle generated [`eed1240`](https://github.com/doesdev/rollup-plugin-analyzer/commit/eed1240ea2f6f824cff6ba6abc97e264f524b236)
- Update locked rollup to 0.60.0 [`96b1cde`](https://github.com/doesdev/rollup-plugin-analyzer/commit/96b1cdebcc47c5913d306fb13ff43ee0a627dbc3)
- Fix node 6 compatibility [`286b8b3`](https://github.com/doesdev/rollup-plugin-analyzer/commit/286b8b32061950d5745d7003dac02f6e76b49d4f)
- Ensure formatted string is as expected in test [`746db48`](https://github.com/doesdev/rollup-plugin-analyzer/commit/746db48771bd8b434b833dfa9c7df7314ce48d32)
- Add travis config [`160859e`](https://github.com/doesdev/rollup-plugin-analyzer/commit/160859e9d1589a63189db11436befdf526ad4175)
- Tweak test title [`0acd1e3`](https://github.com/doesdev/rollup-plugin-analyzer/commit/0acd1e3da6c33cf6e4332ae29fec7c807b53af33)
- Fix travis urls [`46b5bc5`](https://github.com/doesdev/rollup-plugin-analyzer/commit/46b5bc59b3963ef20f305c3a0605632bc2f858b9)
- Add travis badge [`cfda8b7`](https://github.com/doesdev/rollup-plugin-analyzer/commit/cfda8b71e17d29c22988c72315178e65b294e94b)

#### [1.1.0](https://github.com/doesdev/rollup-plugin-analyzer/compare/v1.0.3...1.1.0)

> 21 October 2017

- Add tests, fix filter bugs, 1.1.0 [`db98ac3`](https://github.com/doesdev/rollup-plugin-analyzer/commit/db98ac34e751e939caed7602b3a344a756be448d)

#### v1.0.3

> 19 August 2017

- Add info about plugin, config, v1.0.3 [`2a34c2d`](https://github.com/doesdev/rollup-plugin-analyzer/commit/2a34c2d4b22d7ba639e1146a1588f9e0c6b65dcc)
- Add deps badge [`596c470`](https://github.com/doesdev/rollup-plugin-analyzer/commit/596c470c74bc035360f925b75314f5bae0da7aa8)
- Add filter, init as default, bump to v1.0.2 [`e2c932b`](https://github.com/doesdev/rollup-plugin-analyzer/commit/e2c932b64ee641000294d7d00ba1e6dcffe2eedc)
- Add percent, v1.0.1 [`f2a7c4d`](https://github.com/doesdev/rollup-plugin-analyzer/commit/f2a7c4dc8e661b8a75d190e01cca13af80a76cbd)
- Add index to commit from build script [`6c3bf72`](https://github.com/doesdev/rollup-plugin-analyzer/commit/6c3bf72a66262f8571dd698528a1569545279c08)
- Make root path an init option [`6804deb`](https://github.com/doesdev/rollup-plugin-analyzer/commit/6804debb4f5c0ed2f6013be237066511a50ec8a4)
- Initial commit [`a6b3b9b`](https://github.com/doesdev/rollup-plugin-analyzer/commit/a6b3b9bd8aefd4b2e430fa19177bb809ab937a56)
