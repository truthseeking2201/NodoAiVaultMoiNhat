export type MarketSurveyOverview = {
  vaultName: string;
  safetyScore: number;
  recommendation: string;
  confidence: string;
  trend: number;
  volatility: number;
  rsi: number;
  liquidity: number;
  sentiment: string;
  tvl: number;
  tvlChange: number;
  updatedAt?: string;
};
