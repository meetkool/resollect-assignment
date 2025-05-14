'use client';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { WeeklyCompletionData } from '@/types/analytics';

interface ActivityHeatmapProps {
  data: WeeklyCompletionData[];
}

interface DailyDataItem {
  date: Date;
  count: number;
  total?: number;
  percentage?: number;
}

// Function to get a deterministic pseudorandom number based on day and week
function getSeededRandom(dateStr: string, seed = 42) {
  // Simple seeded pseudorandom number generator
  const str = dateStr + seed;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Normalize to 0-1 range
  return (hash & 0x7fffffff) / 0x7fffffff;
}

const ActivityHeatmap = ({ data }: ActivityHeatmapProps) => {
  const chartRef = useRef<SVGSVGElement>(null);

  // In a real application, we'd have daily data. For this example, 
  // we'll simulate daily data from the weekly data we have.
  const dailyData = useMemo<DailyDataItem[]>(() => {
    if (!data || data.length === 0) {
      // If no data provided, generate some empty placeholder data for the last 3 months
      const emptyData: DailyDataItem[] = [];
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      for (let d = new Date(threeMonthsAgo); d <= now; d.setDate(d.getDate() + 1)) {
        emptyData.push({
          date: new Date(d),
          count: 0
        });
      }
      
      return emptyData;
    }

    // Generate simulated daily data from weekly data
    return data.flatMap(week => {
      const startDate = new Date(week.week_start);
      const endDate = new Date(week.week_end);
      const days: DailyDataItem[] = [];
      
      // Total completed tasks for this week
      const weeklyCompletedTasks = week.completed_tasks;
      
      // Instead of random distribution, use a deterministic approach
      // based on the date string to ensure consistency
      
      // First, determine which days will have activity
      // Use the same algorithm but with deterministic random values
      const activeDaysCount = Math.min(
        7, // Max days in a week
        Math.max(
          1, // At least 1 day if there are completed tasks
          weeklyCompletedTasks > 0 ? Math.ceil(weeklyCompletedTasks / 3) : 0
        )
      );
      
      // Create an array of days (0-6) with deterministically assigned priorities
      // based on the week's start date
      const weekDays = [0, 1, 2, 3, 4, 5, 6].map(day => {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + day);
        const dateStr = dayDate.toISOString().slice(0, 10);
        
        return {
          day,
          // Work days (Mon-Fri) should have higher priority than weekends
          priority: (day === 0 || day === 6) 
            ? getSeededRandom(dateStr, 1) * 0.5 // Lower priority for weekends
            : getSeededRandom(dateStr, 2) + 0.5 // Higher priority for weekdays
        };
      });
      
      // Sort by priority (highest first) to get consistent active days
      weekDays.sort((a, b) => b.priority - a.priority);
      
      // Select the top N days as active days
      const activeDays = weekDays
        .slice(0, activeDaysCount)
        .map(d => d.day)
        .sort(); // Sort numerically again to preserve day order
      
      // Assign tasks to days using deterministic distribution
      const tasksPerDay = Array(7).fill(0);
      
      // First ensure each active day gets at least one task
      activeDays.forEach(dayIndex => {
        if (weeklyCompletedTasks > 0) {
          tasksPerDay[dayIndex] = 1;
        }
      });
      
      // Calculate remaining tasks
      const assignedTasks = activeDays.length;
      const remainingTasks = weeklyCompletedTasks - assignedTasks;
      
      // Distribute remaining tasks using a deterministic approach
      if (remainingTasks > 0 && activeDays.length > 0) {
        // Sort active days by their deterministic 'random' value
        const distributionWeights = activeDays.map(day => {
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + day);
          const dateStr = dayDate.toISOString().slice(0, 10);
          return { day, weight: getSeededRandom(dateStr, 3) };
        });
        
        distributionWeights.sort((a, b) => b.weight - a.weight);
        
        // Distribute tasks proportionally based on weights
        let totalWeight = distributionWeights.reduce((sum, d) => sum + d.weight, 0);
        
        // Ensure totalWeight is not 0
        if (totalWeight === 0) totalWeight = distributionWeights.length;
        
        let tasksLeft = remainingTasks;
        
        // Allocate tasks by weight, from highest to lowest
        for (let i = 0; i < distributionWeights.length - 1 && tasksLeft > 0; i++) {
          const { day, weight } = distributionWeights[i];
          const allocation = Math.min(
            Math.round((weight / totalWeight) * remainingTasks), 
            tasksLeft
          );
          tasksPerDay[day] += allocation;
          tasksLeft -= allocation;
        }
        
        // Assign any remaining tasks to the last day
        if (tasksLeft > 0) {
          const lastDay = distributionWeights[distributionWeights.length - 1].day;
          tasksPerDay[lastDay] += tasksLeft;
        }
      }
      
      // Create the daily data entries
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + i);
        
        if (dayDate > endDate) break;
        
        const dayCount = tasksPerDay[i];
        const totalTasksForDay = Math.ceil(week.total_tasks / 7);
        
        days.push({
          date: new Date(dayDate),
          count: dayCount,
          total: totalTasksForDay,
          percentage: dayCount > 0 && totalTasksForDay > 0 
            ? Math.round((dayCount / totalTasksForDay) * 100) 
            : 0
        });
      }
      
      return days;
    });
  }, [data]);

  useEffect(() => {
    if (!chartRef.current) return;
    
    try {
      d3.select(chartRef.current).selectAll('*').remove();

      // If no data, show "No data available" message
      if (!dailyData.length) {
        const width = chartRef.current.clientWidth;
        const height = 160;
        
        const svg = d3.select(chartRef.current)
          .attr('width', width)
          .attr('height', height);
          
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('fill', '#666')
          .text('No activity data available');
          
        return;
      }

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
        .domain([0, Math.max(3, d3.max(recentData, d => d.count) || 1)])
        .range([
          '#ebedf0', // Light gray (0)
          '#9be9a8', // Light green
          '#40c463', // Medium green
          '#30a14e', // Dark green
          '#216e39'  // Very dark green
        ]);

      // Format date for tooltip
      const formatDate = d3.timeFormat('%a, %b %d, %Y'); // Prettier date format
      
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

      // Create enhanced tooltip with better styling
      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(0,0,0,0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)')
        .style('z-index', '1000')
        .style('pointer-events', 'none')
        .style('max-width', '250px');

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
            .style('stroke-width', '1.5px')
            .style('cursor', 'pointer');
          
          // Enhanced tooltip content with more details
          let tooltipContent = `
            <div style="font-weight: bold; margin-bottom: 4px;">
              ${formatDate(d.date)}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>Tasks completed:</span>
              <span style="font-weight: bold">${d.count}</span>
            </div>
          `;
          
          // Only show these additional metrics if we have task data
          if (d.count > 0) {
            tooltipContent += `
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span>Total tasks:</span>
                <span>${d.total || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Completion rate:</span>
                <span>${d.percentage || 0}%</span>
              </div>
            `;
          }
          
          tooltip
            .style('visibility', 'visible')
            .html(tooltipContent);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .style('stroke', '#e1e4e8')
            .style('stroke-width', '0.5px')
            .style('cursor', 'default');
          
          tooltip.style('visibility', 'hidden');
        });

      // Add text labels for days with tasks
      svg.append('g')
        .attr('class', 'cell-labels')
        .selectAll('.cell-label')
        .data(recentData.filter(d => d.count > 0)) // Only add labels to cells with activity
        .enter().append('text')
        .attr('class', 'cell-label')
        .attr('x', d => {
          // Find this data point's index in the original array
          const index = recentData.findIndex(item => item.date.getTime() === d.date.getTime());
          return Math.floor(index / 7) * fullCellSize + cellSize / 2;
        })
        .attr('y', d => {
          // Find this data point's index in the original array
          const index = recentData.findIndex(item => item.date.getTime() === d.date.getTime());
          return (index % 7) * fullCellSize + cellSize / 2 + 1;
        })
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '7px')
        .style('font-weight', 'bold')
        .style('fill', d => d.count >= 4 ? 'white' : (d.count >= 2 ? '#333' : '#666'))
        .style('pointer-events', 'none')
        .text(d => d.count);

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
        
      // Clean up tooltip when component unmounts
      return () => {
        d3.select('body').selectAll('.tooltip').remove();
      };
    } catch (error) {
      console.error('Error rendering heatmap:', error);
      
      // In case of error, render a fallback message
      if (chartRef.current) {
        d3.select(chartRef.current).selectAll('*').remove();
        
        const width = chartRef.current.clientWidth;
        const height = 160;
        
        const svg = d3.select(chartRef.current)
          .attr('width', width)
          .attr('height', height);
          
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('fill', '#666')
          .text('Error rendering activity heatmap');
      }
    }
  }, [dailyData]);

  return (
    <div className="activity-heatmap" style={{ minHeight: '160px' }}>
      <svg ref={chartRef} width="100%" height="160px" />
    </div>
  );
};

export default ActivityHeatmap; 