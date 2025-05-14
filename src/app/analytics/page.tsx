'use client';
import { useEffect, useState } from 'react';
import { analyticsApi } from '@/services/analyticsApi';
import { AnalyticsCompletionStats, AnalyticsProductivityPatterns, AnalyticsDurationAnalysis } from '@/types/analytics';
import CompletionRateChart from '@/components/analytics/CompletionRateChart';
import StatusDistributionChart from '@/components/analytics/StatusDistributionChart';
import ProductivityByHourChart from '@/components/analytics/ProductivityByHourChart';
import TaskDurationChart from '@/components/analytics/TaskDurationChart';
import ActivityHeatmap from '@/components/analytics/ActivityHeatmap';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './analytics.module.css';

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
        console.log('Fetching analytics data...');
        
        const results = await Promise.allSettled([
          analyticsApi.getCompletionStats(),
          analyticsApi.getProductivityPatterns(),
          analyticsApi.getDurationAnalysis()
        ]);

        console.log('API results:', results);

        if (results[0].status === 'fulfilled') {
          console.log('Completion stats:', results[0].value);
          setCompletionStats(results[0].value);
        } else {
          console.error('Error fetching completion stats:', results[0].reason);
        }

        if (results[1].status === 'fulfilled') {
          console.log('Productivity patterns:', results[1].value);
          setProductivityPatterns(results[1].value);
        } else {
          console.error('Error fetching productivity patterns:', results[1].reason);
        }

        if (results[2].status === 'fulfilled') {
          console.log('Duration analysis:', results[2].value);
          setDurationAnalysis(results[2].value);
        } else {
          console.error('Error fetching duration analysis:', results[2].reason);
        }

        if (results.every(result => result.status === 'rejected')) {
          setError('Failed to load any analytics data. Please check that the backend server is running at http://localhost:8000.');
        } else if (results.some(result => result.status === 'rejected')) {
          setError('Some analytics data could not be loaded. Showing partial results.');
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please check that the backend server is running.');
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

  // Calculate the success rate with proper null checks
  const successCount = completionStats?.status_distribution?.find(item => item.status === 'success')?.count || 0;
  const totalTasks = completionStats?.status_distribution?.reduce((sum, item) => sum + item.count, 0) || 0;
  const overallSuccessRate = totalTasks > 0 ? Math.round((successCount / totalTasks) * 100) : 0;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Task Analytics Dashboard</h1>
      </div>
      
      <div className={`${styles.gridContainer} ${styles.statsGrid}`}>
        <div className={styles.card}>
          <div className={styles.statLabel}>Task Success Rate</div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className={styles.statValue} style={{ color: 'var(--primary)' }}>{overallSuccessRate}%</span>
            <span className={styles.statDescription}>completed successfully</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.statLabel}>Total Tasks</div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className={styles.statValue} style={{ color: 'var(--primary)' }}>{totalTasks}</span>
            <span className={styles.statDescription}>tasks created</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.statLabel}>Avg. Completion Time</div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className={styles.statValue} style={{ color: 'var(--primary)' }}>
              {productivityPatterns?.avg_completion_time_hours?.toFixed(1) || 0}
            </span>
            <span className={styles.statDescription}>hours</span>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.statLabel}>Tasks In Progress</div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className={styles.statValue} style={{ color: 'var(--primary)' }}>
              {completionStats?.status_distribution?.find(item => item.status === 'ongoing')?.count || 0}
            </span>
            <span className={styles.statDescription}>ongoing tasks</span>
          </div>
        </div>
      </div>
      
      <div className={`${styles.gridContainer} ${styles.chartGrid3}`}>
        <div className={`${styles.card} ${styles.cardDoubleWidth}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Completion Rate Trend</h2>
          </div>
          {completionStats?.weekly_completion && (
            <div className={styles.chartContainer}>
              <CompletionRateChart data={completionStats.weekly_completion} />
            </div>
          )}
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Task Status Distribution</h2>
          </div>
          {completionStats?.status_distribution && (
            <div className={styles.chartContainer}>
              <StatusDistributionChart data={completionStats.status_distribution} />
            </div>
          )}
        </div>
      </div>
      
      {/* GitHub-style Activity Heatmap */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Task Activity Heatmap</h2>
        </div>
        {completionStats?.weekly_completion && (
          <ActivityHeatmap data={completionStats.weekly_completion} />
        )}
        <div className={styles.captionText}>
          Daily task completion activity (GitHub-style visualization)
        </div>
      </div>
      
      <div className={`${styles.gridContainer} ${styles.chartGrid2}`}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Productivity by Hour</h2>
          </div>
          {productivityPatterns?.creation_hour_distribution && (
            <div className={styles.chartContainer}>
              <ProductivityByHourChart data={productivityPatterns.creation_hour_distribution} />
            </div>
          )}
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Task Duration Analysis</h2>
          </div>
          {durationAnalysis && (
            <div className={styles.chartContainer}>
              <TaskDurationChart data={durationAnalysis} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 