# rollup-analyzer [![NPM version](https://badge.fury.io/js/rollup-analyzer.svg)](https://npmjs.org/package/rollup-analyzer)   [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

> Analyze file sizes of rollup bundled imports

## install

```sh
$ npm install --save-dev rollup-analyzer
```

## api

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

## usage

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

## License

MIT © [Andrew Carpenter](https://github.com/doesdev)
