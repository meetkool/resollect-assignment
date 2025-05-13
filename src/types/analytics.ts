export interface StatusCount {
  status: string;
  count: number;
}

export interface WeeklyCompletionData {
  week_start: string;
  week_end: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface AnalyticsCompletionStats {
  status_distribution: StatusCount[];
  weekly_completion: WeeklyCompletionData[];
}
export interface HourlyDistribution {
  hour: number;
  count: number;
}
export interface CompletionTimeData {
  id: string;
  title: string;
  completion_time_hours: number;
}
export interface AnalyticsProductivityPatterns {
  creation_hour_distribution: HourlyDistribution[];
  avg_completion_time_hours: number;
  completion_time_data: CompletionTimeData[];
}
export interface DurationData {
  id: string;
  title: string;
  planned_duration_days: number;
  status: string;
}
export interface DurationRange {
  min: number;
  max: number;
  count: number;
}
export interface DurationRanges {
  short: DurationRange;
  medium: DurationRange;
  long: DurationRange;
}
export interface AnalyticsDurationAnalysis {
  duration_data: DurationData[];
  duration_ranges: DurationRanges;
} 