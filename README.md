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
import { rollup } from 'rollup'
const { formatted } from 'rollup-analyzer'

rollup({/*...*/}).then((bundle) => {
  // print console optimized analysis string
  formatted(bundle, {limit: 5}).then(console.log).catch(console.error)
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

Module exports `analyze`, `formatted`, and `plugin` functions

### formatted(bundle, options)
- arguments
  - **bundle** *(Rollup Bundle)*
  - **options** *(Object - see below for available options)*
- returns
  - **analysisText** *(String - well formatted for console printing)*

### analyze(bundle, options)
- arguments
  - **bundle** *(Rollup Bundle)*
  - **options** *(Object - see below for available options)*
- returns
  - **analysis** *(Object)*
    - **id** *(String)* - path of module / rollup module id
    - **size** *(Number)* - size of module in bytes
    - **dependents** *(Array)* - list of dependent module ids / paths
    - **percent** *(Number)* - percentage of module size relative to entire bundle

#### options `Object`
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

## License

MIT © [Andrew Carpenter](https://github.com/doesdev)
