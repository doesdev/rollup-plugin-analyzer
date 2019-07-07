'use strict'

const d3 = window.d3
const testEl = document.getElementById('size-test-el')
const [winX, winY] = [testEl.offsetWidth, testEl.offsetHeight]
const maxSize = winX < winY ? winX : winY
const width = maxSize - 20
const height = maxSize - 20
const radius = Math.min(width, height) / 2
const color = d3.scaleOrdinal(d3.schemeCategory20b)

const data = {
  name: 'TOPICS',
  children: [
    {
      name: 'Topic A',
      children: [
        { name: 'Sub A1', size: 4 },
        { name: 'Sub A2', size: 4 }
      ]
    },
    {
      name: 'Topic B',
      children: [
        { name: 'Sub B1', size: 3 },
        { name: 'Sub B2', size: 3 },
        { name: 'Sub B3', size: 3 }
      ]
    },
    {
      name: 'Topic C',
      children: [
        { name: 'Sub A1', size: 4 },
        { name: 'Sub A2', size: 4 }
      ]
    }
  ]
}

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
