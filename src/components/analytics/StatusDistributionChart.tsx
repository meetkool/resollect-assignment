'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { StatusCount } from '@/types/analytics';
interface StatusDistributionChartProps {
  data: StatusCount[];
}
const StatusDistributionChart = ({ data }: StatusDistributionChartProps) => {
  const chartRef = useRef<SVGSVGElement>(null);
  const statusColors: Record<string, string> = {
    ongoing: '#FCD34D', // yellow
    success: '#10B981', // green
    failure: '#EF4444', // red
  };
  // Capitalize status text for display
  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  useEffect(() => {
    if (!chartRef.current || !data.length) return;
    // Clear any existing chart
    d3.select(chartRef.current).selectAll('*').remove();
    const width = chartRef.current.clientWidth;
    const height = 300;
    const radius = Math.min(width, height) / 2 * 0.8;
    // Create SVG
    const svg = d3.select(chartRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    // Compute the position of each group on the pie
    const pie = d3.pie<StatusCount>()
      .sort(null) // Don't sort, preserve original order
      .value(d => d.count);
    const arcData = pie(data);
    // Shape arcs
    const arc = d3.arc<d3.PieArcDatum<StatusCount>>()
      .innerRadius(0)
      .outerRadius(radius);
    // Add arcs
    svg.selectAll('path')
      .data(arcData)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => statusColors[d.data.status] || '#CBD5E0')  // Default gray if status not found
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.8);
    // Add percentage labels
    const totalCount = data.reduce((sum, d) => sum + d.count, 0);
    svg.selectAll('text.percentage')
      .data(arcData)
      .enter()
      .append('text')
      .attr('class', 'percentage')
      .text(d => {
        const percent = totalCount > 0 
          ? Math.round((d.data.count / totalCount) * 100) 
          : 0;
        return `${percent}%`;
      })
      .attr('transform', d => {
        const centroid = arc.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'white');
    // Add a legend
    const legend = svg.selectAll('.legend')
      .data(arcData)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${radius + 20}, ${-radius + 30 + i * 25})`);
    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => statusColors[d.data.status] || '#CBD5E0');
    legend.append('text')
      .attr('x', 25)
      .attr('y', 12.5)
      .attr('text-anchor', 'start')
      .style('font-size', '14px')
      .text(d => `${formatStatus(d.data.status)} (${d.data.count})`);
  }, [data, statusColors]);
  return (
    <div className="w-full h-full">
      <svg ref={chartRef} className="w-full h-full" />
    </div>
  );
};
export default StatusDistributionChart; 