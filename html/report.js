'use strict'

const d3 = window.d3
const testEl = document.getElementById('size-test-el')
const [winX, winY] = [testEl.offsetWidth, testEl.offsetHeight]
const maxSize = winX < winY ? winX : winY
const width = maxSize - 20
const height = maxSize - 20
const radius = Math.min(width, height) / 2
const color = d3.scaleOrdinal(d3.schemeCategory20b)

const analysis = {
  bundleSize: 2809,
  bundleOrigSize: 11436,
  bundleReduction: 75.44,
  modules: [
    {
      id: '\\virtual-insanity.js',
      size: 2546,
      origSize: 2570,
      renderedExports: ['virtualInsanity'],
      removedExports: [],
      dependents: ['\\jamiroquai.js'],
      percent: 90.64,
      reduction: 0.93
    },
    {
      id: '\\bundle-a.js',
      size: 120,
      origSize: 309,
      renderedExports: [],
      removedExports: [],
      dependents: [],
      percent: 4.27,
      reduction: 61.17
    },
    {
      id: '\\jamiroquai.js',
      size: 83,
      origSize: 169,
      renderedExports: ['smallNestedConstA', 'largeNestedConstB'],
      removedExports: [],
      dependents: ['\\the-alphabet-but-incomplete.js'],
      percent: 2.95,
      reduction: 50.89
    },
    {
      id: '\\the-alphabet-but-incomplete.js',
      size: 33,
      origSize: 123,
      renderedExports: ['anotherSmallConst'],
      removedExports: [],
      dependents: ['\\bundle-a.js'],
      percent: 1.17,
      reduction: 73.17
    },
    {
      id: '\\the-declaration-of-independence.js',
      size: 27,
      origSize: 8265,
      renderedExports: ['aSmallConst'],
      removedExports: ['aLargeConst'],
      dependents: ['\\bundle-a.js'],
      percent: 0.96,
      reduction: 99.67
    }
  ],
  moduleCount: 5
}

let rootModule
const depTree = {}
analysis.modules.forEach((m) => {
  if (!m.dependents.length) rootModule = m
  m.dependents.forEach((d) => (depTree[d] = depTree[d] || []).push(m))
})

const data = {
  name: rootModule.id,
  children: []
}

const addChild = (parent, m) => {
  const { id: name, size } = m
  const tree = depTree[name]
  const el = tree ? { name, children: [] } : { name, size }
  parent.children = parent.children || []
  parent.children.push(el)

  if (tree) tree.forEach((d) => addChild(el, d))

  return el
}

depTree[data.name].forEach((d) => addChild(data, d))

const renderSunburst = (nodeData) => {
  const svg = d3.select('svg')
  svg.attr('width', width)
  svg.attr('height', height)

  const g = svg.append('g')
  g.attr('transform', `translate(${width / 2}, ${height / 2})`)

  const partition = d3.partition().size([2 * Math.PI, radius])
  const root = d3.hierarchy(nodeData).sum((d) => d.size)

  partition(root)

  const arc = d3.arc()
  arc.startAngle((d) => d.x0)
  arc.endAngle((d) => d.x1)
  arc.innerRadius((d) => d.y0)
  arc.outerRadius((d) => d.y1)

  const applyRootViz = () => {
    (g.selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g').attr('class', 'node')
      .append('path')
      .attr('display', (d) => d.depth ? null : 'none')
      .attr('d', arc)
      .style('stroke', '#fff')
      .style('fill', (d) => {
        return color((d.children ? d : d.parent).data.name)
      })
    )
  }

  applyRootViz()

  const computeTextRotation = (d) => {
    const angle = (d.x0 + d.x1) / Math.PI * 90
    return (angle < 90 || angle > 270) ? angle : angle + 180
  }

  const applyNodesViz = () => {
    (g.selectAll('.node')
      .append('text')
      .attr('transform', (d) => {
        const translate = arc.centroid(d)
        const rotate = computeTextRotation(d)
        return `translate(${translate}), rotate(${rotate})`
      })
      .attr('dx', '-20')
      .attr('dy', '.5em')
      .text((d) => d.parent ? d.data.name : '')
    )
  }

  applyNodesViz()
}

renderSunburst(data)
