'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WeeklyCompletionData {
  week_start: string;
  completion_rate: number;
}

interface CompletionRateChartProps {
  data: WeeklyCompletionData[];
}

const CompletionRateChart = ({ data }: CompletionRateChartProps) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    d3.select(chartRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 100, bottom: 50, left: 50 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add gradient definitions
    const defs = svg.append('defs');
    
    // Gradient for completion rate area
    const completionGradient = defs.append('linearGradient')
      .attr('id', 'completion-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    completionGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4F46E5')
      .attr('stop-opacity', 0.3);
    
    completionGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4F46E5')
      .attr('stop-opacity', 0.05);

    const x = d3.scaleBand()
      .domain(data.map(d => d.week_start))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.2);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d, i) => {
        const date = new Date(d.toString());
        return i % 2 === 0 ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }) : '';
      }))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('font-size', '12px');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .style('font-size', '12px');

    // Create area generator
    const completionArea = d3.area<WeeklyCompletionData>()
      .x(d => (x(d.week_start) || 0) + x.bandwidth() / 2)
      .y0(height)
      .y1(d => y(d.completion_rate))
      .curve(d3.curveMonotoneX);

    // Add completion rate area
    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#completion-gradient)')
      .attr('d', completionArea);

    // Add completion rate line
    const completionLine = d3.line<WeeklyCompletionData>()
      .x(d => (x(d.week_start) || 0) + x.bandwidth() / 2)
      .y(d => y(d.completion_rate))
      .curve(d3.curveMonotoneX);

    // Draw completion rate line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4F46E5')
      .attr('stroke-width', 2.5)
      .attr('d', completionLine);

    // Add completion rate dots with hover effect
    const completionDots = svg.selectAll('.completion-dot')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'completion-dot');

    completionDots.append('circle')
      .attr('cx', d => (x(d.week_start) || 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.completion_rate))
      .attr('r', 5)
      .attr('fill', '#4F46E5')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Add hover effects for completion dots
    completionDots
      .on('mouseover', (event, d) => {
        const date = new Date(d.week_start);
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="font-weight: 500; margin-bottom: 4px;">
              ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div style="color: #4F46E5">
              Completion Rate: ${d.completion_rate.toFixed(1)}%
            </div>
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 10}, 0)`);

    // Completion rate legend
    const completionLegend = legend.append('g');
    completionLegend.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 5)
      .style('fill', '#4F46E5');

    completionLegend.append('text')
      .attr('x', 15)
      .attr('y', 0)
      .attr('dy', '.35em')
      .style('font-size', '12px')
      .text('Completion Rate');

    // Add axis labels
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Rate (%)');

    svg.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Week Starting');
  }, [data]);

  return (
    <div className="w-full h-full">
      <svg ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default CompletionRateChart; 