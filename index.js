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
const shakenPct = (n, o) => Math.max((100 - ((n / o) * 100)).toFixed(2), 0);
const match = (str, check) => str.indexOf(check) !== -1;

const analyze = (bundle, opts = {}, format = false) => {
  let { root, limit, filter, hideDeps } = opts;
  root = root || (process && process.cwd ? process.cwd() : null);
  let deps = {};
  let bundleSize = 0;
  let bundleOrigSize = 0;
  let bundleModules = bundle.modules || [];
  let moduleCount = bundleModules.length;

  return new Promise((resolve, reject) => {
    let modules = bundleModules.map((m, i) => {
      let { id, originalLength: origSize, renderedLength, code } = m;
      id = id.replace(root, '');
      let size = renderedLength;
      if (!size && size !== 0) size = code ? Buffer.byteLength(code, 'utf8') : 0;
      bundleSize += size;
      bundleOrigSize += origSize;

      if (Array.isArray(filter) && !filter.some((f) => match(id, f))) return null
      if (typeof filter === 'string' && !match(id, filter)) return null

      m.dependencies.forEach((d) => {
        d = d.replace(root, '');
        deps[d] = deps[d] || [];
        deps[d].push(id);
      });

      return {id, size, origSize}
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

    if (!format) {
      return resolve({bundleSize, bundleOrigSize, bundleReduction, modules})
    }

    let formatted = `` +
      `${borderX}` +
      `Rollup File Analysis\n` +
      `${borderX}` +
      `bundle size:    ${formatBytes(bundleSize)}\n` +
      `original size:  ${formatBytes(bundleOrigSize)}\n` +
      `code reduction: ${bundleReduction} %\n` +
      `module count:   ${moduleCount}\n` +
      `${borderX}`;

    modules.forEach((m) => {
      formatted += `` +
        `file:           ${buf}${m.id}\n` +
        `bundle space:   ${buf}${m.percent} %\n` +
        `rendered size:  ${buf}${formatBytes(m.size)}\n` +
        `original size:  ${buf}${formatBytes(m.origSize || 'unknown')}\n` +
        `code reduction: ${buf}${m.reduction} %\n` +
        `dependents:     ${buf}${m.dependents.length}\n`;
      if (!hideDeps) {
        m.dependents.forEach((d) => {
          formatted += `${tab}-${buf}${d.replace(root, '')}\n`;
        });
      }
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
  let modules;

  let runAnalysis = (out, bundle, isWrite) => new Promise((resolve, reject) => {
    resolve();
    if (written) return
    written = true;
    if (out.bundle) bundle = out.bundle;

    if (!Array.isArray(bundle.modules)) {
      modules.forEach((m) => {
        let bm = bundle.modules[m.id];
        bm.id = bm.id || m.id;
        bm.dependencies = m.dependencies || [];
      });
      modules = Object.keys(bundle.modules).map((k) => bundle.modules[k]);
    } else {
      modules = bundle.modules;
    }

    return analyze({modules}, opts, !opts.onAnalysis).then(cb)
  });

  return {
    name: 'rollup-plugin-analyzer',
    transformChunk: (_a, _b, chunk) => new Promise((resolve, reject) => {
      resolve(null);
      if (!chunk || !chunk.orderedModules) return
      modules = chunk.orderedModules.map((m) => {
        return {id: m.id, dependencies: m.dependencies.map((d) => d.id)}
      });
    }),
    generateBundle: runAnalysis,
    ongenerate: runAnalysis
  }
};

exports.analyze = analyze;
exports.formatted = formatted;
exports.plugin = plugin;
