import { AnalyticsCompletionStats, AnalyticsProductivityPatterns, AnalyticsDurationAnalysis } from '@/types/analytics';

// Determine API URL with fallbacks
const getApiUrl = () => {
  // If provided via environment, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api`;
  }
  
  // For development
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api';
  }
  
  // Production default
  return 'https://resollect-assignment-254j.onrender.com/api';
};

// Mock data for development when backend is not available
const MOCK_DATA = {
  completionStats: {
    status_distribution: [
      { status: 'ongoing', count: 5 },
      { status: 'success', count: 8 },
      { status: 'failure', count: 3 }
    ],
    weekly_completion: [
      { week_start: '2025-04-01', week_end: '2025-04-07', total_tasks: 4, completed_tasks: 2, completion_rate: 50.0 },
      { week_start: '2025-04-08', week_end: '2025-04-14', total_tasks: 6, completed_tasks: 3, completion_rate: 50.0 },
      { week_start: '2025-04-15', week_end: '2025-04-21', total_tasks: 8, completed_tasks: 5, completion_rate: 62.5 }
    ]
  },
  productivityPatterns: {
    creation_hour_distribution: [
      { hour: 9, count: 3 },
      { hour: 10, count: 5 },
      { hour: 14, count: 7 },
      { hour: 16, count: 4 }
    ],
    avg_completion_time_hours: 12.5,
    completion_time_data: [
      { id: '1', title: 'Task 1', completion_time_hours: 8.2 },
      { id: '2', title: 'Task 2', completion_time_hours: 14.5 },
      { id: '3', title: 'Task 3', completion_time_hours: 10.8 }
    ]
  },
  durationAnalysis: {
    duration_data: [
      { id: '1', title: 'Task 1', planned_duration_days: 0.5, status: 'success' },
      { id: '2', title: 'Task 2', planned_duration_days: 3.0, status: 'ongoing' },
      { id: '3', title: 'Task 3', planned_duration_days: 10.0, status: 'failure' }
    ],
    duration_ranges: {
      short: { min: 0, max: 1, count: 2 },
      medium: { min: 1, max: 7, count: 5 },
      long: { min: 7, max: 365, count: 3 }
    }
  }
};

// Use mock data for development if API is unreachable
const USE_MOCK_DATA = true;

export const analyticsApi = {
  async getCompletionStats(): Promise<AnalyticsCompletionStats> {
    try {
      const response = await fetch(`${getApiUrl()}/analytics/completion-stats/`, {
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`Failed to fetch completion statistics (${response.status})`);
      }
      
      const data = await response.json();
      return data.data || data; // Handle both formats: {data: {...}} or direct data
    } catch (error) {
      console.error('Error fetching completion stats:', error);
      
      // Return mock data in development
      if (USE_MOCK_DATA) {
        console.log('Using mock completion stats data');
        return MOCK_DATA.completionStats;
      }
      
      throw error;
    }
  },
  
  async getProductivityPatterns(): Promise<AnalyticsProductivityPatterns> {
    try {
      const response = await fetch(`${getApiUrl()}/analytics/productivity-patterns/`, {
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`Failed to fetch productivity patterns (${response.status})`);
      }
      
      const data = await response.json();
      return data.data || data; // Handle both formats
    } catch (error) {
      console.error('Error fetching productivity patterns:', error);
      
      // Return mock data in development
      if (USE_MOCK_DATA) {
        console.log('Using mock productivity patterns data');
        return MOCK_DATA.productivityPatterns;
      }
      
      throw error;
    }
  },
  
  async getDurationAnalysis(): Promise<AnalyticsDurationAnalysis> {
    try {
      const response = await fetch(`${getApiUrl()}/analytics/duration-analysis/`, {
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`Failed to fetch duration analysis (${response.status})`);
      }
      
      const data = await response.json();
      return data.data || data; // Handle both formats
    } catch (error) {
      console.error('Error fetching duration analysis:', error);
      
      // Return mock data in development
      if (USE_MOCK_DATA) {
        console.log('Using mock duration analysis data');
        return MOCK_DATA.durationAnalysis;
      }
      
      throw error;
    }
  }
}; 