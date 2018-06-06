# rollup-analyzer [![NPM version](https://badge.fury.io/js/rollup-analyzer.svg)](https://npmjs.org/package/rollup-analyzer)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)   [![Dependency Status](https://dependencyci.com/github/doesdev/rollup-analyzer/badge)](https://dependencyci.com/github/doesdev/rollup-analyzer)   [![Build Status](https://travis-ci.com/doesdev/rollup-analyzer.svg)](https://travis-ci.com/doesdev/rollup-analyzer)  

> Analyze file sizes of rollup bundled imports

## rollup-analyzer

Rollup Analyzer gives you a quick look at what's taking up space in your bundle.

### Comes in three scrumptious flavors:

#### [rollup-analyzer-plugin](https://github.com/doesdev/rollup-analyzer-plugin)
Adding as a plugin to your rollup config or build script will print a well
formatted analysis to the console upon bundling.

#### [rollup-analyzer-config](https://github.com/doesdev/rollup-analyzer-config)
If using Rollup's CLI to bundle with no additonal config, pass
`-c node:rollup-analyzer-config` to print a well formatted analysis to your console.

#### [rollup-analyzer](https://github.com/doesdev/rollup-analyzer)
Full analysis module, giving you access to the complete analysis object or well
formatted analysis text for CI and build usage.

## Install

```sh
$ npm install --save-dev rollup-analyzer
```

## Usage

```js
const rollupAnalyzer = require('rollup-analyzer')({limit: 5})
rollup.rollup({/*...*/}).then((bundle) => {
  // print console optimized analysis string
  rollupAnalyzer.formatted(bundle).then(console.log).catch(console.error)
})

// Results in ...
/*
-----------------------------
Rollup File Analysis
-----------------------------
bundle size: 1.146 MB
-----------------------------
file: \node_modules\html5-history-api\history.js
size: 38.502 KB
percent: 3.36%
dependents: 1
  - \app\modules\page.js
-----------------------------
file: \node_modules\pikaday\pikaday.js
size: 34.683 KB
percent: 3.03%
dependents: 1
  - \app\helpers\transformer.js
...
*/
```

## API

### rollupAnalyzer
the default exported function is identical to init, and returns the same functions as export {init, formatted, analyze}. So, you can `require('rollup-analyzer')` or `require('rollup-analyzer')({limit: 5})` and use the same functions.

### rollupAnalyzer.init(options)
set options to use in analysis (this step is optional)
- **options** *(Object)*
  - **limit** - *optional*
    - type: Number
    - default: `null`
    - description: Limit number of files to output analysis of, sorted by DESC size
  - **filter** - *optional*
    - type: Array | String
    - default: `null`
    - description: Filter to only show imports matching the specified name(s)
  - **root** - *optional*
    - type: String
    - default: `process.cwd()`
    - description: Application directory, used to display file paths relatively

### rollupAnalyzer.formatted(bundle)
returns Promise which resolves with well formatted analysis string (for CLI printing)
- **bundle** *(Rollup Bundle)* - *required*

### rollupAnalyzer.analyze(bundle)
returns Promise which resolves with array of objects describing each imported file
- **bundle** *(Rollup Bundle)* - *required*

returned array's child analysis objects have the following properties
- **id** *(String)* - path of module / rollup module id
- **size** *(Number)* - size of module in bytes
- **dependents** *(Array)* - list of dependent module ids / paths
- **percent** *(Number)* - percentage of module size relative to entire bundle

## License

MIT © [Andrew Carpenter](https://github.com/doesdev)
