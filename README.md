# rollup-plugin-analyzer [![NPM version](https://badge.fury.io/js/rollup-plugin-analyzer.svg)](https://npmjs.org/package/rollup-plugin-analyzer)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)   [![Dependency Status](https://dependencyci.com/github/doesdev/rollup-plugin-analyzer/badge)](https://dependencyci.com/github/doesdev/rollup-plugin-analyzer)   [![Build Status](https://travis-ci.com/doesdev/rollup-plugin-analyzer.svg)](https://travis-ci.com/doesdev/rollup-plugin-analyzer)  

> Mad metrics for your rollup bundles, know all the things

## rollup-plugin-analyzer

See what's bloating your bundle, how treeshaking has treated you, and other
great stuff. Perfect for console printing an analysis of your bundle or
integrating in your CI workflows.

### Comes in two scrumptious flavors:

#### [rollup-plugin-analyzer](https://github.com/doesdev/rollup-plugin-analyzer)
Adding as a plugin to your rollup config or build script will allow you to
print a well formatted analysis to the console upon bundling or get a full
analysis object for CI purposes.

#### [rollup-config-analyzer](https://github.com/doesdev/rollup-config-analyzer)
If using Rollup's CLI to bundle with no additional config, pass
`-c node:rollup-config-analyzer` to print a well formatted analysis to your console.

## Install

```sh
$ npm install --save-dev rollup-plugin-analyzer
```

## Usage

### from rollup config
```js
import { plugin as analyze } from 'rollup-plugin-analyzer'

export default {
  entry: 'module.js',
  dest: 'index.js',
  format: 'cjs',
  plugins: [analyze()]
}
```

### from build script
```js
import { rollup } from 'rollup'
import { plugin as analyze } from 'rollup-plugin-analyzer'

rollup({
  entry: 'main.js',
  plugins: [analyze()]
}).then(...)
```

### CI usage example
```js
import { rollup } from 'rollup'
import { plugin as analyze } from 'rollup-plugin-analyzer'
const limitBytes = 1e6

const onAnalysis = ({bundleSize}) => {
  if (bundleSize < limitBytes) return
  console.log(`Bundle size exceeds ${limitBytes} bytes: ${bundleSize} bytes`)
  return process.exit(1)
}

rollup({
  entry: 'main.js',
  plugins: [analyze({onAnalysis, skipFormatted: true})]
}).then(...)
```

### results
logged to console on rollup completion
```sh
-----------------------------
Rollup File Analysis
-----------------------------
bundle size:    2.809 KB
original size:  11.384 KB
code reduction: 75.33 %
module count:   5
-----------------------------
file:            \test\fixtures\import-d.js
bundle space:    90.64 %
rendered size:   2.546 KB
original size:   2.57 KB
code reduction:  0.93 %
dependents:      1
  - \test\fixtures\import-c.js
-----------------------------
file:            \test\fixtures\bundle.js
bundle space:    4.27 %
rendered size:   120 Bytes
original size:   267 Bytes
code reduction:  55.06 %
dependents:      0
-----------------------------
file:            \test\fixtures\import-c.js
bundle space:    2.95 %
rendered size:   83 Bytes
original size:   161 Bytes
code reduction:  48.45 %
dependents:      1
  - \test\fixtures\import-b.js
...
```

## Options

- **stdout** - *optional*
  - type: Boolean
  - default: `false`
  - description: Print to stdout (console.log) instead of stderr (console.error)
- **limit** - *optional*
  - type: Number
  - default: `null`
  - description: Limit number of files to output analysis of, sorted by DESC size
- **filter** - *optional*
  - type: Array | String | Function
  - default: `null`
  - description: Filter to only show imports matching the specified name(s)
  - notes: Function receives `module` object specified below, should return boolean
- **root** - *optional*
  - type: String
  - default: `process.cwd()`
  - description: Application directory, used to display file paths relatively
- **hideDeps** - *optional*
  - type: Boolean
  - default: `false`
  - description: Don't itemize dependents in the formatted output
- **showExports** - *optional*
  - type: Boolean
  - default: `false`
  - description: Show used and unused exports
- **skipFormatted** - *optional*
  - type: Boolean
  - default: `false`
  - description: Don't output formatted string
- **writeTo** - *optional*
  - type: Function
  - default: `null`
  - description: Callback to be invoked with formatted string
  - callback invoked with:
    - **analysisString** *(String)*
- **onAnalysis** - *optional*
  - type: Function
  - default: `null`
  - description: Callback to be invoked with analysis object
  - callback invoked with:
    - **analysisObject** *(Object)*
      - **bundleSize** *(Number)* - rendered bundle size in bytes
      - **bundleOrigSize** *(Number)* - original bundle size in bytes
      - **bundleReduction** *(Number)* - percentage of rendered bundle size reduction
      - **moduleCount** *(Number)* - Count of all included modules
      - **modules** *(Array)* - array of `module` analysis objects
        - **module** *(Object)*
          - **id** *(String)* - path of module / rollup module id
          - **size** *(Number)* - size of rendered module code in bytes
          - **origSize** *(Number)* - size of module's original code in bytes
          - **dependents** *(Array)* - list of dependent module ids / paths
          - **percent** *(Number)* - percentage of module size relative to entire bundle
          - **reduction** *(Number)* - percentage of rendered size reduction
          - **usedExports** *(Array)* - list of used named exports
          - **unusedExports** *(Array)* - list of unused named exports


## Other considerations

Rollup allows you to output to multiple files. If you are outputting to multiple
files you will get a distinct analysis for each output file. Each analysis
will contain data on the files imported by the respective target.

## License

MIT © [Andrew Carpenter](https://github.com/doesdev)
