'use client';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { WeeklyCompletionData } from '@/types/analytics';

interface ActivityHeatmapProps {
  data: WeeklyCompletionData[];
}

const ActivityHeatmap = ({ data }: ActivityHeatmapProps) => {
  const chartRef = useRef<SVGSVGElement>(null);

  // In a real application, we'd have daily data. For this example, 
  // we'll simulate daily data from the weekly data we have.
  const dailyData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Generate simulated daily data from weekly data
    return data.flatMap(week => {
      const startDate = new Date(week.week_start);
      const endDate = new Date(week.week_end);
      const days = [];
      
      // For each day in the week
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Simulate a random count for each day, influenced by the weekly count
        const dayCount = Math.max(0, Math.floor(
          (week.completed_tasks / 7) * (0.5 + Math.random())
        ));
        
        days.push({
          date: new Date(d),
          count: dayCount
        });
      }
      
      return days;
    });
  }, [data]);

  useEffect(() => {
    if (!chartRef.current || !dailyData.length) return;

    d3.select(chartRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const cellSize = 14; // Increased cell size for better visibility
    const cellMargin = 3;
    const fullCellSize = cellSize + cellMargin;
    
    // Calculate width based on available space
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const weeksInView = Math.floor(width / fullCellSize);
    
    // Get data for the last N weeks
    const recentData = dailyData.slice(-weeksInView * 7);
    
    // Define color scale
    const colorScale = d3.scaleQuantize<string>()
      .domain([0, d3.max(recentData, d => d.count) || 1])
      .range([
        '#ebedf0', // Light gray (0)
        '#9be9a8', // Light green
        '#40c463', // Medium green
        '#30a14e', // Dark green
        '#216e39'  // Very dark green
      ]);

    // Format date for tooltip
    const formatDate = d3.timeFormat('%Y-%m-%d');
    
    // Calculate height based on 7 days per week
    const height = 7 * fullCellSize;
    
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add x-axis for months
    const firstDate = recentData[0]?.date;
    const lastDate = recentData[recentData.length - 1]?.date;
    
    if (firstDate && lastDate) {
      const monthFormat = d3.timeFormat('%b');
      const months = d3.timeMonth.range(d3.timeMonth.floor(firstDate), d3.timeMonth.ceil(lastDate));
      
      svg.append('g')
        .attr('class', 'months')
        .selectAll('.month')
        .data(months)
        .enter().append('text')
        .attr('class', 'month')
        .attr('x', d => {
          // Find how many days from the start date to this month
          const daysFromStart = d3.timeDay.count(firstDate, d);
          return Math.floor(daysFromStart / 7) * fullCellSize;
        })
        .attr('y', -5)
        .text(d => monthFormat(d))
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#666');
    }

    // Add y-axis for days of week
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    svg.append('g')
      .attr('class', 'days')
      .selectAll('.day')
      .data(dayLabels)
      .enter().append('text')
      .attr('class', 'day')
      .attr('x', -25)
      .attr('y', (d, i) => i * fullCellSize + fullCellSize / 2)
      .attr('dy', '0.35em')
      .text(d => d)
      .style('font-size', '11px')
      .style('fill', '#666');

    // Add cells for each day
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '5px 10px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('z-index', '1000');

    svg.append('g')
      .attr('class', 'cells')
      .selectAll('.cell')
      .data(recentData)
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('x', (d, i) => Math.floor(i / 7) * fullCellSize)
      .attr('y', (d, i) => (i % 7) * fullCellSize)
      .attr('fill', d => colorScale(d.count))
      .attr('rx', 2)
      .attr('ry', 2)
      .style('stroke', '#e1e4e8')
      .style('stroke-width', '0.5px')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .style('stroke', '#666')
          .style('stroke-width', '1.5px');
          
        tooltip
          .style('visibility', 'visible')
          .html(`${formatDate(d.date)}: ${d.count} tasks completed`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('stroke', '#e1e4e8')
          .style('stroke-width', '0.5px');
          
        tooltip.style('visibility', 'hidden');
      });

    // Add legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 180}, ${height + 15})`);

    // Label
    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text('Fewer')
      .style('font-size', '11px')
      .style('fill', '#666');

    // Boxes
    const legendColors = colorScale.range();
    
    legend.selectAll('.legend-cell')
      .data(legendColors)
      .enter().append('rect')
      .attr('class', 'legend-cell')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('x', (d, i) => 40 + i * (cellSize + 1))
      .attr('y', -cellSize / 2)
      .attr('fill', d => d)
      .attr('rx', 2)
      .attr('ry', 2)
      .style('stroke', '#e1e4e8')
      .style('stroke-width', '0.5px');

    // Label
    legend.append('text')
      .attr('x', 40 + legendColors.length * (cellSize + 1) + 5)
      .attr('y', 0)
      .text('More')
      .style('font-size', '11px')
      .style('fill', '#666');

    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [dailyData]);

  return (
    <div className="activity-heatmap" style={{ minHeight: '160px' }}>
      <svg ref={chartRef} width="100%" height="160px" />
    </div>
  );
};

export default ActivityHeatmap; 