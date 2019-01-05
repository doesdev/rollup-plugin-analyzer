'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const buf = ' ';
const tab = '  ';
const borderX = `${Array(30).join('-')}\n`;
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Byte'
  const k = 1000;
  const dm = 3;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
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

    const { hideDeps, root, showExports } = opts || {};
    if (!hideDeps) {
      m.dependents.forEach((d) => {
        formatted += `${tab}-${buf}${d.replace(root, '')}\n`;
      });
    }
    if (showExports && m.renderedExports && m.removedExports) {
      formatted += `used exports:   ${buf}${m.renderedExports.length}\n`;
      m.renderedExports.forEach((e) => {
        formatted += `${tab}-${buf}${e}\n`;
      });
      formatted += `unused exports: ${buf}${m.removedExports.length}\n`;
      m.removedExports.forEach((e) => {
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

  const deps = {};
  const bundleModules = bundle.modules || (bundle.cache || {}).modules || [];
  const moduleCount = bundleModules.length;

  let bundleSize = 0;
  let bundleOrigSize = 0;

  let modules = bundleModules.map((m, i) => {
    let {
      id,
      originalLength: origSize,
      renderedLength,
      code,
      renderedExports,
      removedExports
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

    return { id, size, origSize, renderedExports, removedExports }
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
    const analysis = analyzer(bundle, opts);
    return resolve(analysis)
  } catch (ex) { return reject(ex) }
});

const formatted = (bundle, opts) => new Promise((resolve, reject) => {
  try {
    const analysis = analyzer(bundle, opts);
    return resolve(reporter(analysis, opts))
  } catch (ex) { return resolve(ex.toString()) }
});

const plugin = (opts = {}) => {
  const writeTo = opts.writeTo || (opts.stdout ? console.log : console.error);

  const onAnalysis = (analysis) => {
    if (typeof opts.onAnalysis === 'function') opts.onAnalysis(analysis);
    if (!opts.skipFormatted) writeTo(reporter(analysis, opts));
  };

  return {
    name: 'rollup-plugin-analyzer',
    buildStart: function () {
      const ctx = this || {};
      if (!ctx.meta || +(ctx.meta.rollupVersion || 0).charAt(0) < 1) {
        const msg = `` +
          `rollup-plugin-analyzer: Rollup version not supported\n${tab}` +
          `Starting with 3.0.0 only Rollup >= 1.0.0 is supported\n${tab}` +
          `Use rollup-plugin-analyzer 2.1.0 for prior Rollup versions`;
        console.error(msg);
      }
    },
    generateBundle: function (outOpts, bundle, isWrite) {
      const ctx = this || {};
      if (!ctx.meta || +(ctx.meta.rollupVersion || 0).charAt(0) < 1) return null
      const getDeps = (id) => {
        return ctx.getModuleInfo ? ctx.getModuleInfo(id).importedIds : []
      };

      return new Promise((resolve, reject) => {
        resolve();

        const modules = [];
        Object.entries(bundle).forEach(([outId, { modules: bundleMods }]) => {
          Object.entries(bundleMods).forEach(([id, moduleInfo]) => {
            const dependencies = getDeps(id);
            modules.push(Object.assign({}, moduleInfo, { id, dependencies }));
          });
        });

        return analyze({ modules }, opts).then(onAnalysis).catch(console.error)
      })
    }
  }
};

Object.assign(plugin, { plugin, analyze, formatted, reporter });

exports.reporter = reporter;
exports.analyze = analyze;
exports.formatted = formatted;
exports.plugin = plugin;
exports.default = plugin;
