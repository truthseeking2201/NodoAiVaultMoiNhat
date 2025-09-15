export const PERIOD_TABS = [
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
];

export const PERIOD_TABS_1W = [{ value: "ONE_WEEK", label: "1W" }];

export const ANALYTICS_TABS = [
  { value: "POSITION_PRICE", label: "Position Price" },
  // { value: "APY_YIELDS", label: "APY & Yields" },
];

export const ACTIVITIES_TABS = [
  { value: "ALL", label: "All" },
  { value: "SWAP", label: "Swap" },
  { value: "ADD_LIQUIDITY", label: "Add" },
  { value: "REMOVE_LIQUIDITY", label: "Remove" },
];

export const METHOD_DEPOSIT = {
  SINGLE: "SINGLE",
  DUAL: "DUAL",
};
export const METHOD_DEPOSIT_TABS = [
  { value: METHOD_DEPOSIT.DUAL, label: "Dual" },
  { value: METHOD_DEPOSIT.SINGLE, label: "Single" },
];

export const ITEMS_PER_PAGE = 5;
export const ADD_LIQUIDITY_TYPES = [
  "ADD_LIQUIDITY",
  "OPEN",
  "ADD_PROFIT_UPDATE_RATE",
  "CLAIM_REWARDS",
];
export const REMOVE_LIQUIDITY_TYPES = ["REMOVE_LIQUIDITY", "CLOSE"];
export const SWAP_TYPES = ["SWAP"];

// Types for chart data
export interface ChartDataPoint {
  time: string;
  percentage: number;
  price: number;
}

// Mock data for user position charts - Daily (24 hours)
export const mockDataLiveChart: ChartDataPoint[] = [
  { time: "2025-09-14T15:00:00Z", percentage: 0.0, price: 100.0 },
  { time: "2025-09-14T15:10:00Z", percentage: 1.5, price: 101.5 },
  { time: "2025-09-14T15:20:00Z", percentage: 3.2, price: 103.2 },
  { time: "2025-09-14T15:30:00Z", percentage: 2.8, price: 102.8 },
  { time: "2025-09-14T15:40:00Z", percentage: -1.2, price: 98.8 },
  { time: "2025-09-14T15:50:00Z", percentage: 0.5, price: 100.5 },
  { time: "2025-09-14T15:60:00Z", percentage: 4.7, price: 104.7 },
  { time: "2025-09-14T15:70:00Z", percentage: 6.1, price: 106.1 },
  { time: "2025-09-14T15:80:00Z", percentage: 3.9, price: 103.9 },
  { time: "2025-09-14T15:90:00Z", percentage: 2.3, price: 102.3 },
  { time: "2025-09-14T15:12:00Z", percentage: -0.8, price: 99.2 },
  { time: "2025-09-14T15:13:00Z", percentage: 1.7, price: 101.7 },
  { time: "2025-09-14T15:14:00Z", percentage: 5.4, price: 105.4 },
];

// Mock data for user position charts - Weekly (7 days)
export const mockDataLiveChart2: ChartDataPoint[] = [
  { time: "Mon", percentage: 0.0, price: 100.0 },
  { time: "Tue", percentage: 2.1, price: 102.1 },
  { time: "Wed", percentage: -1.5, price: 98.5 },
  { time: "Thu", percentage: 4.8, price: 104.8 },
  { time: "Fri", percentage: 6.2, price: 106.2 },
  { time: "Sat", percentage: 3.7, price: 103.7 },
  { time: "Sun", percentage: 8.1, price: 108.1 },
];
