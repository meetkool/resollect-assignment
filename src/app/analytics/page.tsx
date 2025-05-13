'use client';
import { useEffect, useState } from 'react';
import { analyticsApi } from '@/services/analyticsApi';
import { AnalyticsCompletionStats, AnalyticsProductivityPatterns, AnalyticsDurationAnalysis } from '@/types/analytics';
import CompletionRateChart from '@/components/analytics/CompletionRateChart';
import StatusDistributionChart from '@/components/analytics/StatusDistributionChart';
import ProductivityByHourChart from '@/components/analytics/ProductivityByHourChart';
import TaskDurationChart from '@/components/analytics/TaskDurationChart';
import LoadingSpinner from '@/components/LoadingSpinner';
export default function AnalyticsDashboard() {
  const [completionStats, setCompletionStats] = useState<AnalyticsCompletionStats | null>(null);
  const [productivityPatterns, setProductivityPatterns] = useState<AnalyticsProductivityPatterns | null>(null);
  const [durationAnalysis, setDurationAnalysis] = useState<AnalyticsDurationAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all analytics data with Promise.allSettled to handle partial failures
        const results = await Promise.allSettled([
          analyticsApi.getCompletionStats(),
          analyticsApi.getProductivityPatterns(),
          analyticsApi.getDurationAnalysis()
        ]);
        // Process each result individually
        if (results[0].status === 'fulfilled') {
          setCompletionStats(results[0].value);
        } else {
          console.error('Error fetching completion stats:', results[0].reason);
        }
        if (results[1].status === 'fulfilled') {
          setProductivityPatterns(results[1].value);
        } else {
          console.error('Error fetching productivity patterns:', results[1].reason);
        }
        if (results[2].status === 'fulfilled') {
          setDurationAnalysis(results[2].value);
        } else {
          console.error('Error fetching duration analysis:', results[2].reason);
        }
        // Only show error if all requests failed
        if (results.every(result => result.status === 'rejected')) {
          setError('Failed to load any analytics data. Please try again later.');
        } else if (results.some(result => result.status === 'rejected')) {
          setError('Some analytics data could not be loaded. Showing partial results.');
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-300 rounded-lg text-red-700">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }
  // Calculate the overall success rate
  const successRate = completionStats?.status_distribution.find(item => item.status === 'success')?.count || 0;
  const totalTasks = completionStats?.status_distribution.reduce((sum, item) => sum + item.count, 0) || 0;
  const overallSuccessRate = totalTasks > 0 ? Math.round((successRate / totalTasks) * 100) : 0;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Analytics Dashboard</h1>
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Task Success Rate</h3>
          <div className="flex items-end">
            <span className="text-4xl font-bold text-indigo-600">{overallSuccessRate}%</span>
            <span className="text-gray-500 ml-2 text-sm">completed successfully</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Tasks</h3>
          <div className="flex items-end">
            <span className="text-4xl font-bold text-indigo-600">{totalTasks}</span>
            <span className="text-gray-500 ml-2 text-sm">tasks created</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Avg. Completion Time</h3>
          <div className="flex items-end">
            <span className="text-4xl font-bold text-indigo-600">
              {productivityPatterns?.avg_completion_time_hours.toFixed(1) || 0}
            </span>
            <span className="text-gray-500 ml-2 text-sm">hours</span>
          </div>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Completion Rate Trend</h2>
          {completionStats && (
            <CompletionRateChart data={completionStats.weekly_completion} />
          )}
        </div>
        {}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Task Status Distribution</h2>
          {completionStats && (
            <StatusDistributionChart data={completionStats.status_distribution} />
          )}
        </div>
        {}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Productivity by Hour</h2>
          {productivityPatterns && (
            <ProductivityByHourChart data={productivityPatterns.creation_hour_distribution} />
          )}
        </div>
        {}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Task Duration Analysis</h2>
          {durationAnalysis && (
            <TaskDurationChart data={durationAnalysis} />
          )}
        </div>
      </div>
    </div>
  );
} 