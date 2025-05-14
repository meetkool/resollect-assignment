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
  
  return 'https://resollect-assignment-254j.onrender.com/api';
};

// Get WebSocket URL based on API URL
const getWsUrl = () => {
  const apiUrl = getApiUrl();
  // Convert http:// to ws:// and https:// to wss://
  return apiUrl.replace(/^http/, 'ws').replace(/\/api$/, '/ws');
};

// Persistent storage for mock data to keep it consistent between reloads
let cachedMockData: {
  completionStats: AnalyticsCompletionStats;
  productivityPatterns: AnalyticsProductivityPatterns;
  durationAnalysis: AnalyticsDurationAnalysis;
} | null = null;

// Function to generate deterministic weekly completion data
const generateWeeklyCompletionData = () => {
  // If we already have cached data, return it
  if (cachedMockData?.completionStats?.weekly_completion) {
    return cachedMockData.completionStats.weekly_completion;
  }
  
  const data = [];
  
  // Use a fixed date range instead of current date
  // This makes the data consistent between reloads
  const endDate = new Date(2023, 4, 15); // May 15, 2023 as fixed end date
  const startDate = new Date(2023, 1, 1); // Feb 1, 2023 as fixed start date
  
  // Create predetermined weekly task counts that sum to 65
  const weeklyCompletedTasks = [
    3, 3, 5, 2, 6, // Feb
    7, 4, 5, 4, // Mar
    6, 8, 4, // Apr
    5, 3, // May first 2 weeks
  ];
  
  // Ensure the total is 65
  const sum = weeklyCompletedTasks.reduce((a, b) => a + b, 0);
  if (sum !== 65) {
    weeklyCompletedTasks[weeklyCompletedTasks.length - 1] += (65 - sum);
  }
  
  // Generate weekly data with the fixed task counts
  const currentDate = new Date(startDate);
  let weekIndex = 0;
  
  while (currentDate <= endDate && weekIndex < weeklyCompletedTasks.length) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Get completed tasks for this week from our predefined array
    const completedTasks = weeklyCompletedTasks[weekIndex];
    
    // Total tasks is set to create appropriate completion rates
    // Creating a pattern of fluctuating rates
    let totalTasks;
    if (weekIndex % 3 === 0) {
      totalTasks = Math.round(completedTasks / 0.65); // ~65% completion rate
    } else if (weekIndex % 3 === 1) {
      totalTasks = Math.round(completedTasks / 0.8); // ~80% completion rate
    } else {
      totalTasks = Math.round(completedTasks / 0.5); // ~50% completion rate
    }
    
    // Ensure totalTasks is at least completedTasks
    totalTasks = Math.max(totalTasks, completedTasks);
    
    // Calculate completion rate based on these numbers
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    data.push({
      week_start: weekStart.toISOString().slice(0, 10),
      week_end: weekEnd.toISOString().slice(0, 10),
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_rate: completionRate
    });
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekIndex++;
  }
  
  return data;
};

// Generate consistent mock data
const getMockData = () => {
  if (cachedMockData) {
    return cachedMockData;
  }
  
  cachedMockData = {
    completionStats: {
      status_distribution: [
        { status: 'ongoing', count: 15 },
        { status: 'success', count: 65 },
        { status: 'failure', count: 93 }
      ],
      weekly_completion: generateWeeklyCompletionData()
    },
    productivityPatterns: {
      creation_hour_distribution: [
        { hour: 1, count: 2 },
        { hour: 2, count: 1 },
        { hour: 3, count: 1 },
        { hour: 7, count: 12 },
        { hour: 9, count: 20 },
        { hour: 10, count: 5 },
        { hour: 11, count: 10 },
        { hour: 13, count: 15 },
        { hour: 14, count: 7 },
        { hour: 15, count: 8 },
        { hour: 16, count: 9 },
        { hour: 17, count: 12 },
        { hour: 20, count: 5 },
        { hour: 22, count: 3 }
      ],
      avg_completion_time_hours: 12.5,
      completion_time_data: [
        { id: '1', title: 'Task 1', completion_time_hours: 8.2 },
        { id: '2', title: 'Task 2', completion_time_hours: 14.5 },
        { id: '3', title: 'Task 3', completion_time_hours: 10.8 },
        { id: '4', title: 'Task 4', completion_time_hours: 6.3 },
        { id: '5', title: 'Task 5', completion_time_hours: 18.1 },
        { id: '6', title: 'Task 6', completion_time_hours: 9.5 }
      ]
    },
    durationAnalysis: {
      duration_data: [
        { id: '1', title: 'Task 1', planned_duration_days: 0.5, status: 'success' },
        { id: '2', title: 'Task 2', planned_duration_days: 3.0, status: 'ongoing' },
        { id: '3', title: 'Task 3', planned_duration_days: 10.0, status: 'failure' },
        { id: '4', title: 'Task 4', planned_duration_days: 0.3, status: 'success' },
        { id: '5', title: 'Task 5', planned_duration_days: 4.5, status: 'success' },
        { id: '6', title: 'Task 6', planned_duration_days: 1.0, status: 'failure' },
        { id: '7', title: 'Task 7', planned_duration_days: 2.0, status: 'success' },
        { id: '8', title: 'Task 8', planned_duration_days: 6.0, status: 'ongoing' }
      ],
      duration_ranges: {
        short: { min: 0, max: 1, count: 137 },
        medium: { min: 1, max: 7, count: 24 },
        long: { min: 7, max: 365, count: 2 }
      }
    }
  };
  
  return cachedMockData;
};

// Class to handle WebSocket connection for real-time updates
class AnalyticsWebSocket {
  private static instance: AnalyticsWebSocket;
  private ws: WebSocket | null = null;
  private listeners: { [key: string]: ((data: unknown) => void)[] } = {};
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): AnalyticsWebSocket {
    if (!AnalyticsWebSocket.instance) {
      AnalyticsWebSocket.instance = new AnalyticsWebSocket();
    }
    return AnalyticsWebSocket.instance;
  }
  
  public connect(): void {
    if (this.ws) return; // Already connected or connecting
    
    try {
      const wsUrl = getWsUrl() + '/analytics';
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type && this.listeners[data.type]) {
            this.listeners[data.type].forEach(listener => listener(data.payload));
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this.ws = null;
        
        // Try to reconnect
        this.tryReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Let onclose handle reconnection
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.tryReconnect();
    }
  }
  
  private tryReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached, giving up');
      return;
    }
    
    const delay = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
    console.log(`Trying to reconnect in ${delay}ms...`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  public subscribe(type: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    
    this.listeners[type].push(callback);
    
    // If we have listeners but no connection, try to connect
    if (!this.connected && !this.ws) {
      this.connect();
    }
    
    // Return unsubscribe function
    return () => {
      if (this.listeners[type]) {
        this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
      }
    };
  }
  
  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connected = false;
    this.listeners = {};
  }
}

// Always use mock data for development since the API is not available
const USE_MOCK_DATA = true;

export const analyticsApi = {
  async getCompletionStats(): Promise<AnalyticsCompletionStats> {
    try {
      // Skip the API call entirely if using mock data
      if (USE_MOCK_DATA) {
        console.log('Using mock completion stats data');
        return getMockData().completionStats;
      }
      
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
      
      // Return mock data when API fails
      console.log('Falling back to mock completion stats data');
      return getMockData().completionStats;
    }
  },
  
  async getProductivityPatterns(): Promise<AnalyticsProductivityPatterns> {
    try {
      // Skip the API call entirely if using mock data
      if (USE_MOCK_DATA) {
        console.log('Using mock productivity patterns data');
        return getMockData().productivityPatterns;
      }
      
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
      
      // Return mock data when API fails
      console.log('Falling back to mock productivity patterns data');
      return getMockData().productivityPatterns;
    }
  },
  
  async getDurationAnalysis(): Promise<AnalyticsDurationAnalysis> {
    try {
      // Skip the API call entirely if using mock data
      if (USE_MOCK_DATA) {
        console.log('Using mock duration analysis data');
        return getMockData().durationAnalysis;
      }
      
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
      
      // Return mock data when API fails
      console.log('Falling back to mock duration analysis data');
      return getMockData().durationAnalysis;
    }
  },
  
  // Subscribe to real-time updates - returns an unsubscribe function
  subscribeToUpdates(type: string, callback: (data: unknown) => void): () => void {
    // If using mock data, no need for real-time updates
    if (USE_MOCK_DATA) {
      console.log('Mock mode - WebSocket subscription would be skipped');
      return () => {}; // No-op unsubscribe
    }
    
    const websocket = AnalyticsWebSocket.getInstance();
    return websocket.subscribe(type, callback);
  },
  
  // Clean up WebSocket connection
  disconnect(): void {
    const websocket = AnalyticsWebSocket.getInstance();
    websocket.disconnect();
  }
}; 