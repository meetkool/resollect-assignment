'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { HourlyDistribution } from '@/types/analytics';
interface ProductivityByHourChartProps {
  data: HourlyDistribution[];
}
const ProductivityByHourChart = ({ data }: ProductivityByHourChartProps) => {
  const chartRef = useRef<SVGSVGElement>(null);
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };
  useEffect(() => {
    if (!chartRef.current || !data.length) return;
    const sortedData = [...data].sort((a, b) => a.hour - b.hour);
    d3.select(chartRef.current).selectAll('*').remove();
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    // Create x and y scales
    const x = d3.scaleBand()
      .domain(sortedData.map(d => d.hour.toString()))
      .range([0, width])
      .padding(0.2);
    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.count) || 0])
      .nice()
      .range([height, 0]);
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => formatHour(parseInt(d.toString()))))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5));
    // Add y-axis grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.7);
    // Add bars
    svg.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.hour.toString()) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', '#4F46E5')
      .attr('rx', 2); // Rounded corners
    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Number of Tasks Created');
    // Add x-axis label
    svg.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 5})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Hour of Day');
  }, [data]);
  return (
    <div className="w-full h-full">
      <svg ref={chartRef} className="w-full h-full" />
    </div>
  );
};
export default ProductivityByHourChart; 