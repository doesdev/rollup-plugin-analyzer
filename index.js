'use strict';

// Setup
const buf = ' ';
const tab = '  ';
const borderX = `${Array(30).join('-')}\n`;
let proc = process;
let root = proc && proc.cwd ? proc.cwd() : null;
let limit;
let filter;

// Helpers
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Byte'
  let k = 1000;
  let dm = 3;
  let sizes = ['Bytes', 'KB', 'MB', 'GB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
};

// Main
function init (opts) {
  opts = opts || {};
  limit = opts.limit;
  filter = opts.filter;
  root = opts.root || root;
}

function analyzer$1 (opts) {
  init(opts);
  return {init, formatted, analyze}
}
analyzer$1.init = init;
analyzer$1.formatted = formatted;
analyzer$1.analyze = analyze;

function formatted (bndl) { return analyze(bndl, true) }

function analyze (bundle, format) {
  let deps = {};
  let bundleSize = 0;
  return new Promise((resolve, reject) => {
    let modules = bundle.modules.map((m, i) => {
      let id = m.id.replace(root, '');
      let size = Buffer.byteLength(m.code, 'utf8') || 0;
      bundleSize += size;
      if (Array.isArray(filter) && !filter.some((f) => id.match(f))) return null
      if (filter && !id.match(filter)) return null
      m.dependencies.forEach((d) => {
        d = d.replace(root, '');
        deps[d] = deps[d] || [];
        deps[d].push(id);
      });
      return {id, size}
    }).filter((m) => m);
    modules.sort((a, b) => b.size - a.size);
    if (limit) modules = modules.slice(0, limit);
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
}

module.exports = analyzer$1;
