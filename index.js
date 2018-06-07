'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

const analyze = (bundle, opts = {}, format = false) => {
  let { root, limit, filter } = opts;
  let deps = {};
  let bundleSize = 0;
  let bundleModules = bundle.modules;

  return new Promise((resolve, reject) => {
    if (bundleModules && !Array.isArray(bundleModules)) {
      bundleModules = Object.keys(bundleModules).map((id) => {
        let { originalLength, renderedLength } = bundleModules[id];
        return {id, dependencies: [], originalLength, renderedLength}
      });
    }

    let modules = bundleModules.map((m, i) => {
      let id = m.id.replace(root, '');
      let size = m.renderedLength || Buffer.byteLength(m.code, 'utf8') || 0;
      bundleSize += size;

      if (Array.isArray(filter) && !filter.some((f) => id.match(f))) return null
      if (typeof filter === 'string' && !id.match(filter)) return null

      m.dependencies.forEach((d) => {
        d = d.replace(root, '');
        deps[d] = deps[d] || [];
        deps[d].push(id);
      });

      return {id, size}
    }).filter((m) => m);

    modules.sort((a, b) => b.size - a.size);
    if (limit || limit === 0) modules = modules.slice(0, limit);
    modules.forEach((m) => {
      m.dependents = deps[m.id] || [];
      m.percent = ((m.size / bundleSize) * 100).toFixed(2);
    });

    if (!format) return resolve(modules)

    let heading = `Rollup File Analysis\n`;
    let displaySize = `${borderX}bundle size: ${formatBytes(bundleSize)}\n`;
    let formatted = `${borderX}${heading}${displaySize}${borderX}`;

    modules.forEach((m) => {
      formatted += `file:${buf}${m.id}\n`;
      formatted += `size:${buf}${formatBytes(m.size)}\n`;
      formatted += `percent:${buf}${m.percent}%\n`;
      formatted += `dependents:${buf}${m.dependents.length}\n`;
      m.dependents.forEach((d) => {
        formatted += `${tab}-${buf}${d.replace(root, '')}\n`;
      });
      formatted += `${borderX}`;
    });

    return resolve(formatted)
  })
};

const formatted = (bndl, opts) => analyze(bndl, opts, true);

const plugin = (opts = {}) => {
  let cb = opts.writeTo || (opts.stdout ? console.log : console.error);
  if (opts.onAnalysis) cb = opts.onAnalysis;
  let written;

  let runAnalysis = (outputOptions, bundle, isWrite) => {
    if (written) return
    if (outputOptions.bundle) bundle = outputOptions.bundle;
    written = true;
    return analyze(bundle, opts, !opts.onAnalysis).then(cb)
  };
  return {
    name: 'rollup-analyzer-plugin',
    generateBundle: runAnalysis,
    ongenerate: runAnalysis
  }
};

exports.analyze = analyze;
exports.formatted = formatted;
exports.plugin = plugin;
