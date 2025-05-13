import { AnalyticsCompletionStats, AnalyticsProductivityPatterns, AnalyticsDurationAnalysis } from '@/types/analytics';

// Use the production API URL directly
const API_URL = 'https://resollect-assignment-254j.onrender.com/api';
// const API_URL = 'http://localhost:8000/api';


export const analyticsApi = {
  async getCompletionStats(): Promise<AnalyticsCompletionStats> {
    const response = await fetch(`${API_URL}/analytics/completion-stats/`, {
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch completion statistics');
    }
    return response.json();
  },
  async getProductivityPatterns(): Promise<AnalyticsProductivityPatterns> {
    const response = await fetch(`${API_URL}/analytics/productivity-patterns/`, {
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch productivity patterns');
    }
    return response.json();
  },
  async getDurationAnalysis(): Promise<AnalyticsDurationAnalysis> {
    const response = await fetch(`${API_URL}/analytics/duration-analysis/`, {
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch duration analysis');
    }
    return response.json();
  }
}; 