'use strict'

// Setup
const buf = ' '
const tab = '  '
const borderX = `${Array(30).join('-')}\n`
let proc = process
let root = proc && proc.cwd ? proc.cwd() : null
let limit

// Helpers
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Byte'
  let k = 1000
  let dm = 3
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Exports
export {init, analyze, formatted}

// Main
function init (opts) {
  opts = opts || {}
  limit = opts.limit
  root = opts.root || root
}

function formatted (bndl) { return analyze(bndl, true) }

function analyze (bundle, format) {
  let deps = {}
  return new Promise((resolve, reject) => {
    let modules = bundle.modules.map((m, i) => {
      let id = m.id.replace(root, '')
      m.dependencies.forEach((d) => {
        d = d.replace(root, '')
        deps[d] = deps[d] || []
        deps[d].push(id)
      })
      return {id, size: Buffer.byteLength(m.code, 'utf8') || 0}
    })
    modules.sort((a, b) => b.size - a.size)
    if (limit) modules = modules.slice(0, limit)
    modules.forEach((m) => { m.dependents = deps[m.id] || [] })
    if (!format) return resolve(modules)
    let heading = `Rollup file analysis\n`
    let formatted = `${borderX}${heading}${borderX}`
    modules.forEach((m) => {
      formatted += `file:${buf}${m.id}\n`
      formatted += `size:${buf}${formatBytes(m.size)}\n`
      formatted += `dependents:${buf}${m.dependents.length}\n`
      m.dependents.forEach((d) => {
        formatted += `${tab}-${buf}${d.replace(root, '')}\n`
      })
      formatted += `${borderX}`
    })
    return resolve(formatted)
  })
}
