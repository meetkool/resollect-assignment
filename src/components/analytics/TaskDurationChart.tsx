'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnalyticsDurationAnalysis, DurationData } from '@/types/analytics';
interface TaskDurationChartProps {
  data: AnalyticsDurationAnalysis;
}
const TaskDurationChart = ({ data }: TaskDurationChartProps) => {
  const chartRef = useRef<SVGSVGElement>(null);
  // Define colors for different statuses
  const statusColors: Record<string, string> = {
    ongoing: '#FCD34D', // yellow
    success: '#10B981', // green
    failure: '#EF4444', // red
  };
  const formatDurationRange = (key: string): string => {
    switch(key) {
      case 'short': return 'Short (< 1 day)';
      case 'medium': return 'Medium (1-7 days)';
      case 'long': return 'Long (> 7 days)';
      default: return key;
    }
  };
  useEffect(() => {
    if (!chartRef.current || !data.duration_ranges) return;
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
    // Convert data object to array for D3
    const rangeData = Object.entries(data.duration_ranges).map(([key, value]) => ({
      range: key,
      count: value.count
    }));
    // Set scales
    const x = d3.scaleBand()
      .domain(rangeData.map(d => d.range))
      .range([0, width])
      .padding(0.3);
    const y = d3.scaleLinear()
      .domain([0, d3.max(rangeData, d => d.count) || 0])
      .nice()
      .range([height, 0]);
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => formatDurationRange(d.toString())));
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5));
    // Add bars
    svg.selectAll('.bar')
      .data(rangeData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.range) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', d => {
        if (d.range === 'short') return '#10B981'; // green for short tasks
        if (d.range === 'medium') return '#3B82F6'; // blue for medium tasks
        return '#8B5CF6'; // purple for long tasks
      });
    // Add bar labels
    svg.selectAll('.bar-label')
      .data(rangeData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => (x(d.range) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.count > 0 ? d.count.toString() : '')
      .style('font-size', '12px')
      .style('font-weight', 'bold');
    // Add scatter plot for individual tasks
    if (data.duration_data.length > 0) {
      // Create a second chart below the bar chart for scatter plot
      const scatterHeight = 80;
      const scatterMargin = { top: 20, bottom: 20 };
      const scatterY = height + margin.bottom;
      const scatterGroup = svg.append('g')
        .attr('transform', `translate(0, ${scatterY})`);
      // Scale for scatter plot
      const xScatter = d3.scaleLinear()
        .domain([0, d3.max(data.duration_data, d => d.planned_duration_days) || 7])
        .nice()
        .range([0, width]);
      // X-axis for scatter plot
      scatterGroup.append('g')
        .attr('transform', `translate(0, ${scatterHeight})`)
        .call(d3.axisBottom(xScatter).ticks(5));
      // Add scatter points
      scatterGroup.selectAll('.dot')
        .data(data.duration_data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScatter(d.planned_duration_days))
        .attr('cy', scatterHeight / 2)
        .attr('r', 4)
        .attr('fill', d => statusColors[d.status] || '#CBD5E0')
        .attr('opacity', 0.7);
      // Add x-axis label for scatter plot
      scatterGroup.append('text')
        .attr('x', width / 2)
        .attr('y', scatterHeight + scatterMargin.bottom)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Task Duration (days)');
    }
    // Add y-axis label for main chart
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Number of Tasks');
  }, [data]);
  return (
    <div className="w-full h-full">
      <svg ref={chartRef} className="w-full h-full" />
    </div>
  );
};
export default TaskDurationChart; 