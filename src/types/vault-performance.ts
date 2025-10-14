export type VaultPerformanceSummaryResponse = {
  your: {
    pnlUsd: number;
    pnlPct: number;
    depositsUsd: number;
  };
  context: {
    utilization: number;
    feesRewards24hUsd: number;
  };
  peer: {
    percentilePnLPct: number;
  };
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
  isYou?: boolean;
};

export type VaultPerformancePeersResponse = {
  total: number;
  rows: VaultPerformanceLeaderboardRow[];
  sort: "pnlPct" | "pnlUsd" | "depositsUsd";
  limit: number;
  offset: number;
  you?: {
    rank: number;
    alias: string;
    pnlPct: number;
    pnlUsd: number;
    depositsUsd: number;
  };
  cohortSize: number;
};

export const MIN_PERFORMANCE_COHORT = 10;
