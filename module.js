'use strict'

const buf = ' '
const tab = '  '
const borderX = `${Array(30).join('-')}\n`
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Byte'
  let k = 1000
  let dm = 3
  let sizes = ['Bytes', 'KB', 'MB', 'GB']
  let i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
const shakenPct = (n, o) => Math.max((100 - ((n / o) * 100)).toFixed(2), 0)
const match = (str, check) => str.indexOf(check) !== -1

export const reporter = (analysis, opts) => {
  let formatted = `` +
    `${borderX}` +
    `Rollup File Analysis\n` +
    `${borderX}` +
    `bundle size:    ${formatBytes(analysis.bundleSize)}\n` +
    `original size:  ${formatBytes(analysis.bundleOrigSize)}\n` +
    `code reduction: ${analysis.bundleReduction} %\n` +
    `module count:   ${analysis.moduleCount}\n` +
    `${borderX}`

  analysis.modules.forEach((m) => {
    formatted += `` +
      `file:           ${buf}${m.id}\n` +
      `bundle space:   ${buf}${m.percent} %\n` +
      `rendered size:  ${buf}${formatBytes(m.size)}\n` +
      `original size:  ${buf}${formatBytes(m.origSize || 'unknown')}\n` +
      `code reduction: ${buf}${m.reduction} %\n` +
      `dependents:     ${buf}${m.dependents.length}\n`

    let { hideDeps, root, showExports } = opts || {}
    if (!hideDeps) {
      m.dependents.forEach((d) => {
        formatted += `${tab}-${buf}${d.replace(root, '')}\n`
      })
    }
    if (showExports && m.usedExports && m.unusedExports) {
      formatted += `used exports:   ${buf}${m.usedExports.length}\n`
      m.usedExports.forEach((e) => {
        formatted += `${tab}-${buf}${e}\n`
      })
      formatted += `unused exports: ${buf}${m.unusedExports.length}\n`
      m.unusedExports.forEach((e) => {
        formatted += `${tab}-${buf}${e}\n`
      })
    }
    formatted += `${borderX}`
  })

  return formatted
}

const analyzer = (bundle, opts = {}) => {
  let { root, limit, filter } = opts
  root = root || (process && process.cwd ? process.cwd() : null)
  let deps = {}
  let bundleSize = 0
  let bundleOrigSize = 0
  let bundleModules = bundle.modules || []
  let moduleCount = bundleModules.length

  let modules = bundleModules.map((m, i) => {
    let {
      id,
      originalLength: origSize,
      renderedLength,
      code,
      usedExports,
      unusedExports
    } = m
    id = id.replace(root, '')
    let size = renderedLength
    if (!size && size !== 0) size = code ? Buffer.byteLength(code, 'utf8') : 0
    bundleSize += size
    bundleOrigSize += origSize

    if (Array.isArray(filter) && !filter.some((f) => match(id, f))) return null
    if (typeof filter === 'string' && !match(id, filter)) return null

    m.dependencies.forEach((d) => {
      d = d.replace(root, '')
      deps[d] = deps[d] || []
      deps[d].push(id)
    })

    return {id, size, origSize, usedExports, unusedExports}
  }).filter((m) => m)

  modules.sort((a, b) => b.size - a.size)
  if (limit || limit === 0) modules = modules.slice(0, limit)
  modules.forEach((m) => {
    m.dependents = deps[m.id] || []
    m.percent = Math.min(((m.size / bundleSize) * 100).toFixed(2), 100)
    m.reduction = shakenPct(m.size, m.origSize)
  })
  if (typeof filter === 'function') modules = modules.filter(filter)

  let bundleReduction = shakenPct(bundleSize, bundleOrigSize)

  return {bundleSize, bundleOrigSize, bundleReduction, modules, moduleCount}
}

export const analyze = (bundle, opts) => new Promise((resolve, reject) => {
  try {
    let analysis = analyzer(bundle, opts)
    return resolve(analysis)
  } catch (ex) { return reject(ex) }
})

export const formatted = (bundle, opts) => new Promise((resolve, reject) => {
  try {
    let analysis = analyzer(bundle, opts)
    return resolve(reporter(analysis, opts))
  } catch (ex) { return resolve(ex.toString()) }
})

export const plugin = (opts = {}) => {
  let writeTo = opts.writeTo || (opts.stdout ? console.log : console.error)
  let depMap = {}

  let onAnalysis = (analysis) => {
    if (typeof opts.onAnalysis === 'function') opts.onAnalysis(analysis)
    if (!opts.skipFormatted) writeTo(reporter(analysis, opts))
  }

  let runAnalysis = (out, bundle, isWrite) => new Promise((resolve, reject) => {
    resolve()
    if (out.bundle) bundle = out.bundle
    let modules = bundle.modules

    if (Array.isArray(modules)) {
      return analyze({modules}, opts).then(onAnalysis).catch(console.error)
    }

    modules = Object.keys(modules).map((k) => {
      let module = Object.assign(modules[k], depMap[k] || {})
      module.usedExports = module.renderedExports
      module.unusedExports = module.removedExports
      return module
    })
    return analyze({modules}, opts).then(onAnalysis).catch(console.error)
  })

  return {
    name: 'rollup-plugin-analyzer',
    transformChunk: (_a, _b, chunk) => new Promise((resolve, reject) => {
      resolve(null)
      if (!chunk || !chunk.orderedModules) return
      chunk.orderedModules.forEach(({id, dependencies}) => {
        depMap[id] = {id, dependencies: dependencies.map((d) => d.id)}
      })
    }),
    generateBundle: runAnalysis,
    ongenerate: runAnalysis
  }
}
