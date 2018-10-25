'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var readPkgUp = _interopDefault(require('read-pkg-up'));
var mkdirp = _interopDefault(require('mkdirp'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));

const toSizes = modules => {
  let sizes = {};
  for (let { id, size } of modules) {
    let cwd = path.dirname(id);
    let { pkg, path: pkgPath } = readPkgUp.sync({ cwd });
    let [name, relPath] = pkg !== null
      ? [pkg.name, path.relative(path.dirname(pkgPath), id)]
      : ['(unknown)', id];
    sizes[name] = sizes[name] || [];
    sizes[name][relPath] = size;
  }
  return sizes
};

const toData = sizes => {
  let children = [];
  for (let [name, subdata] of Object.entries(sizes)) {
    children.push({
      name,
      children: Object.entries(subdata).map(([name, value]) => ({
        name,
        value
      }))
    });
  }
  return { name: 'root', children }
};

const toHtml = sizes => {
  let data = toData(sizes);
  let json = JSON.stringify(data, null, 2);
  return `<!doctype html>
<html>
<head>
<title>rollup-plugin-analyzer report</title>
<style>
html, body, #container {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
</head>
<body>
<div id="container"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min.js"></script>
<script src="https://unpkg.com/sunburst-chart"></script>
<script>
var scheme = d3.scaleOrdinal(d3.schemeCategory10)
Sunburst()
  .color(function (d, parent) {
    return scheme(parent ? parent.data.name : null)
  })
  .tooltipContent(function (d, node) {
    return node.value + ' bytes'
  })
  .data(${json})(
    document.getElementById('container'))
</script>
</body>
</html>`
};

const writeHtmlReport = (modules, filePath) => {
  return new Promise((resolve, reject) => {
    let sizes = toSizes(modules);
    let html = toHtml(sizes);
    mkdirp.sync(path.dirname(filePath));
    fs.writeFile(filePath, html, 'utf8', (err) => err ? reject(err) : resolve());
  })
};

const buf = ' ';
const tab = '  ';
const borderX = `${Array(30).join('-')}\n`;
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Byte'
  let k = 1000;
  let dm = 3;
  let sizes = ['Bytes', 'KB', 'MB', 'GB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
};
const shakenPct = (n, o) => Math.max((100 - ((n / o) * 100)).toFixed(2), 0);
const match = (str, check) => str.indexOf(check) !== -1;

const reporter = (analysis, opts) => {
  let formatted = `` +
    `${borderX}` +
    `Rollup File Analysis\n` +
    `${borderX}` +
    `bundle size:    ${formatBytes(analysis.bundleSize)}\n` +
    `original size:  ${formatBytes(analysis.bundleOrigSize)}\n` +
    `code reduction: ${analysis.bundleReduction} %\n` +
    `module count:   ${analysis.moduleCount}\n` +
    `${borderX}`;

  analysis.modules.forEach((m) => {
    formatted += `` +
      `file:           ${buf}${m.id}\n` +
      `bundle space:   ${buf}${m.percent} %\n` +
      `rendered size:  ${buf}${formatBytes(m.size)}\n` +
      `original size:  ${buf}${formatBytes(m.origSize || 'unknown')}\n` +
      `code reduction: ${buf}${m.reduction} %\n` +
      `dependents:     ${buf}${m.dependents.length}\n`;

    let { hideDeps, root, showExports } = opts || {};
    if (!hideDeps) {
      m.dependents.forEach((d) => {
        formatted += `${tab}-${buf}${d.replace(root, '')}\n`;
      });
    }
    if (showExports && m.usedExports && m.unusedExports) {
      formatted += `used exports:   ${buf}${m.usedExports.length}\n`;
      m.usedExports.forEach((e) => {
        formatted += `${tab}-${buf}${e}\n`;
      });
      formatted += `unused exports: ${buf}${m.unusedExports.length}\n`;
      m.unusedExports.forEach((e) => {
        formatted += `${tab}-${buf}${e}\n`;
      });
    }
    formatted += `${borderX}`;
  });

  return formatted
};

const analyzer = (bundle, opts = {}) => {
  let { root, limit, filter, transformModuleId } = opts;
  root = root || (process && process.cwd ? process.cwd() : null);
  if (typeof transformModuleId !== 'function') transformModuleId = undefined;
  let deps = {};
  let bundleSize = 0;
  let bundleOrigSize = 0;
  let bundleModules = bundle.modules || [];
  let moduleCount = bundleModules.length;

  let modules = bundleModules.map((m, i) => {
    let {
      id,
      originalLength: origSize,
      renderedLength,
      code,
      usedExports,
      unusedExports
    } = m;
    id = id.replace(root, '');
    if (transformModuleId) id = transformModuleId(id);
    let size = renderedLength;
    if (!size && size !== 0) size = code ? Buffer.byteLength(code, 'utf8') : 0;
    bundleSize += size;
    bundleOrigSize += origSize;

    if (Array.isArray(filter) && !filter.some((f) => match(id, f))) return null
    if (typeof filter === 'string' && !match(id, filter)) return null

    m.dependencies.forEach((d) => {
      d = d.replace(root, '');
      if (transformModuleId) d = transformModuleId(d);
      deps[d] = deps[d] || [];
      deps[d].push(id);
    });

    return { id, size, origSize, usedExports, unusedExports }
  }).filter((m) => m);

  modules.sort((a, b) => b.size - a.size);
  if (limit || limit === 0) modules = modules.slice(0, limit);
  modules.forEach((m) => {
    m.dependents = deps[m.id] || [];
    m.percent = Math.min(((m.size / bundleSize) * 100).toFixed(2), 100);
    m.reduction = shakenPct(m.size, m.origSize);
  });
  if (typeof filter === 'function') modules = modules.filter(filter);

  let bundleReduction = shakenPct(bundleSize, bundleOrigSize);

  return { bundleSize, bundleOrigSize, bundleReduction, modules, moduleCount }
};

const analyze = (bundle, opts) => new Promise((resolve, reject) => {
  try {
    let analysis = analyzer(bundle, opts);
    return resolve(analysis)
  } catch (ex) { return reject(ex) }
});

const formatted = (bundle, opts) => new Promise((resolve, reject) => {
  try {
    let analysis = analyzer(bundle, opts);
    return resolve(reporter(analysis, opts))
  } catch (ex) { return resolve(ex.toString()) }
});

const plugin = (opts = {}) => {
  let writeTo = opts.writeTo || (opts.stdout ? console.log : console.error);
  let depMap = {};

  let onAnalysis = (analysis) => {
    if (typeof opts.onAnalysis === 'function') opts.onAnalysis(analysis);
    if (typeof opts.htmlReportPath === 'string') {
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!MADEITHERE!!!!!!1111111111111');
      let rptProm = writeHtmlReport(analysis.modules, opts.htmlReportPath);
      if (opts.onHtmlReport) {
        rptProm.then((rp) => opts.onHtmlReport());
        rptProm.catch((err) => opts.onHtmlReport(err));
      }
    }
    if (!opts.skipFormatted) writeTo(reporter(analysis, opts));
  };

  let runAnalysis = (out, bundle, isWrite) => new Promise((resolve, reject) => {
    resolve();
    if (out.bundle) bundle = out.bundle;
    let modules = bundle.modules;

    if (Array.isArray(modules)) {
      return analyze({ modules }, opts).then(onAnalysis).catch(console.error)
    }

    modules = Object.keys(modules).map((k) => {
      let module = Object.assign(modules[k], depMap[k] || {});
      module.usedExports = module.renderedExports;
      module.unusedExports = module.removedExports;
      return module
    });
    return analyze({ modules }, opts).then(onAnalysis).catch(console.error)
  });

  return {
    name: 'rollup-plugin-analyzer',
    transformChunk: (_a, _b, chunk) => new Promise((resolve, reject) => {
      resolve(null);
      if (!chunk || !chunk.orderedModules) return
      chunk.orderedModules.forEach(({ id, dependencies }) => {
        depMap[id] = { id, dependencies: dependencies.map((d) => d.id) };
      });
    }),
    generateBundle: runAnalysis,
    ongenerate: runAnalysis
  }
};

exports.reporter = reporter;
exports.analyze = analyze;
exports.formatted = formatted;
exports.plugin = plugin;
