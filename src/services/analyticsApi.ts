import { AnalyticsCompletionStats, AnalyticsProductivityPatterns, AnalyticsDurationAnalysis } from '@/types/analytics';
const API_URL = 'http://localhost:8000/api';
export const analyticsApi = {
  async getCompletionStats(): Promise<AnalyticsCompletionStats> {
    const response = await fetch(`${API_URL}/analytics/completion-stats/`);
    if (!response.ok) {
      throw new Error('Failed to fetch completion statistics');
    }
    return response.json();
  },
  async getProductivityPatterns(): Promise<AnalyticsProductivityPatterns> {
    const response = await fetch(`${API_URL}/analytics/productivity-patterns/`);
    if (!response.ok) {
      throw new Error('Failed to fetch productivity patterns');
    }
    return response.json();
  },
  async getDurationAnalysis(): Promise<AnalyticsDurationAnalysis> {
    const response = await fetch(`${API_URL}/analytics/duration-analysis/`);
    if (!response.ok) {
      throw new Error('Failed to fetch duration analysis');
    }
    return response.json();
  }
}; 