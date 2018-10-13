import readPkgUp from 'read-pkg-up'
import mkdirp from 'mkdirp'
import fs from 'fs'
import path from 'path'

const toSizes = modules => {
  const sizes = {}
  for (const { id: idRaw, size } of modules) {
    const id = idRaw.replace(/^\0(?:commonjs-proxy:)?/, '')
    const cwd = path.dirname(id)
    const { pkg, path: pkgPath } = readPkgUp.sync({ cwd })
    const [name, relPath] =
      pkg != null
        ? [pkg.name, path.relative(path.dirname(pkgPath), id)]
        : ['(unknown)', id]
    sizes[name] = sizes[name] || []
    sizes[name][relPath] = size
  }
  return sizes
}

const toData = sizes => {
  const children = []
  for (const [name, subdata] of Object.entries(sizes)) {
    children.push({
      name,
      children: Object.entries(subdata).map(([name, value]) => ({
        name,
        value
      }))
    })
  }
  return {
    name: 'root',
    children
  }
}

const toHtml = sizes => {
  const data = toData(sizes)
  const json = JSON.stringify(data, null, 2)
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
}

export const writeHtmlReport = (modules, filePath) => {
  const sizes = toSizes(modules)
  const html = toHtml(sizes)
  mkdirp.sync(path.dirname(filePath))
  fs.writeFileSync(filePath, html, 'utf8')
}
