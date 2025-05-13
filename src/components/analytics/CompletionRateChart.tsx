'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WeeklyCompletionData } from '@/types/analytics';
interface CompletionRateChartProps {
  data: WeeklyCompletionData[];
}
const CompletionRateChart = ({ data }: CompletionRateChartProps) => {
  const chartRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!chartRef.current || !data.length) return;
    // Clear any existing chart
    d3.select(chartRef.current).selectAll('*').remove();
    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    // Create SVG
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    // Set scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.week_start))
      .range([0, width])
      .padding(0.1);
    const y = d3.scaleLinear()
      .domain([0, 100])  // Percentage from 0 to 100
      .range([height, 0]);
    // Create axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d, i) => {
        return i % 2 === 0 ? new Date(d.toString()).toLocaleDateString() : '';
      }))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
    // Add line for completion rate
    const line = d3.line<WeeklyCompletionData>()
      .x(d => (x(d.week_start) || 0) + x.bandwidth() / 2)
      .y(d => y(d.completion_rate))
      .curve(d3.curveMonotoneX);
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4F46E5')
      .attr('stroke-width', 2)
      .attr('d', line);
    // Add dots
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => (x(d.week_start) || 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.completion_rate))
      .attr('r', 4)
      .attr('fill', '#4F46E5');
    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Completion Rate (%)');
    // Add x-axis label
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