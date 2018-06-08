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

export const analyze = (bundle, opts = {}, format = false) => {
  let { root, limit, filter } = opts
  let deps = {}
  let entrySize
  let bundleSize = 0
  let bundleModules = bundle.modules

  return new Promise((resolve, reject) => {
    let modules = bundleModules.map((m, i) => {
      let { id, originalLength: origSize, renderedLength, isEntry, code } = m
      id = id.replace(root, '')
      let size = renderedLength
      if (!size && size !== 0) size = code ? Buffer.byteLength(code, 'utf8') : 0
      if (isEntry) entrySize = size
      bundleSize += size

      if (Array.isArray(filter) && !filter.some((f) => id.match(f))) return null
      if (typeof filter === 'string' && !id.match(filter)) return null

      m.dependencies.forEach((d) => {
        d = d.replace(root, '')
        deps[d] = deps[d] || []
        deps[d].push(id)
      })

      return {id, size, origSize, isEntry}
    }).filter((m) => m)

    if (entrySize) bundleSize = entrySize

    modules.sort((a, b) => b.size - a.size)
    if (limit || limit === 0) modules = modules.slice(0, limit)
    modules.forEach((m) => {
      m.dependents = deps[m.id] || []
      m.percent = ((m.size / bundleSize) * 100).toFixed(2)
      m.reduction = 100 - ((m.size / m.origSize) * 100).toFixed(2)
    })

    if (!format) return resolve(modules)

    let heading = `Rollup File Analysis\n`
    let displaySize = `${borderX}bundle size: ${formatBytes(bundleSize)}\n`
    let formatted = `${borderX}${heading}${displaySize}${borderX}`

    modules.forEach((m) => {
      if (m.isEntry) return
      formatted += `file:${buf}${m.id}\n`
      formatted += `size:${buf}${formatBytes(m.size)}\n`
      formatted += `percent:${buf}${m.percent}%\n`
      formatted += `orig. size:${buf}${formatBytes(m.origSize || 'unknown')}\n`
      formatted += `code reduction:${buf}${m.reduction}%\n`
      formatted += `dependents:${buf}${m.dependents.length}\n`
      m.dependents.forEach((d) => {
        formatted += `${tab}-${buf}${d.replace(root, '')}\n`
      })
      formatted += `${borderX}`
    })

    return resolve(formatted)
  })
}

export const formatted = (bndl, opts) => analyze(bndl, opts, true)

export const plugin = (opts = {}) => {
  let cb = opts.writeTo || (opts.stdout ? console.log : console.error)
  if (opts.onAnalysis) cb = opts.onAnalysis
  let written
  let modules

  let runAnalysis = (out, bundle, isWrite) => new Promise((resolve, reject) => {
    resolve()
    if (written) return
    written = true
    if (out.bundle) bundle = out.bundle
    if (!Array.isArray(bundle.modules)) {
      modules.forEach((m) => {
        let bm = bundle.modules[m.id]
        bm.id = bm.id || m.id
        bm.isEntry = bm.isEntry || m.isEntry
        bm.dependencies = m.dependencies || []
      })
      modules = Object.keys(bundle.modules).map((k) => bundle.modules[k])
    } else {
      modules = bundle.modules
    }
    return analyze({modules}, opts, !opts.onAnalysis).then(cb)
  })
  return {
    name: 'rollup-plugin-analyzer',
    transformChunk: (_a, _b, chunk) => new Promise((resolve, reject) => {
      resolve(null)
      if (!chunk || !chunk.orderedModules) return
      modules = chunk.orderedModules.map((m) => {
        return {
          id: m.id,
          isEntry: m.isEntryPoint,
          dependencies: m.dependencies.map((d) => d.id)
        }
      })
    }),
    generateBundle: runAnalysis,
    ongenerate: runAnalysis
  }
}
