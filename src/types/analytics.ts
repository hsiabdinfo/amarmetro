export interface VisitorStatsSummary {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
  activeNow: number;
  mobilePercentage: number;
  desktopPercentage: number;
  dailyStats: Array<{
    date: string;
    label: string;
    visits: number;
    uniques: number;
  }>;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
  }>;
  topReferrers: Array<{
    source: string;
    count: number;
  }>;
  updatedAt: string;
}

export interface GoogleAnalyticsConfig {
  measurementId: string; // e.g. G-XXXXXXXXXX
  isEnabled: boolean;
  debugMode?: boolean;
  trackPageviews: boolean;
  trackClicks: boolean;
  updatedAt?: string;
}

export const DEFAULT_GA_CONFIG: GoogleAnalyticsConfig = {
  measurementId: 'G-7L9X8K2M1Q', // Default demo or placeholder measurement ID
  isEnabled: true,
  debugMode: false,
  trackPageviews: true,
  trackClicks: true,
};
