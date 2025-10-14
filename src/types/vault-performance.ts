export type PerformanceMetricBreakdown = {
  depositsUsd: number;
  withdrawalsUsd: number;
  currentValueUsd: number;
  pnlUsd: number;
  pnlPct: number;
};

export type VaultPerformanceSummaryResponse = {
  your: PerformanceMetricBreakdown;
  context: {
    apr24h: number;
    apr7d: number;
    apy7d: number;
    utilizationRate?: number;
    feesRewards24h?: number;
  };
  cohortSize: number;
};

export type PerformanceDistributionBin = {
  x0: number;
  x1: number;
  count: number;
};

export type VaultPerformanceDistributionResponse = {
  bins: PerformanceDistributionBin[];
  your: {
    value: number;
    percentile: number;
  };
  cohortSize: number;
};

export type VaultPerformanceLeaderboardRow = {
  rank: number;
  alias: string;
  pnlPct: number;
  pnlUsd: number;
  depositsUsd: number;
  withdrawalsUsd: number;
  currentValueUsd: number;
  isYou?: boolean;
};

export type VaultPerformanceLeaderboardResponse = {
  rows: VaultPerformanceLeaderboardRow[];
  sort: "pnlPct" | "pnlUsd" | "depositsUsd" | "withdrawalsUsd" | "currentValueUsd";
  cohortSize: number;
};

export const MIN_PERFORMANCE_COHORT = 10;
