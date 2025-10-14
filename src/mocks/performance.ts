import {
  VaultPerformanceSummaryResponse,
  VaultPerformanceDistributionResponse,
  VaultPerformancePeersResponse,
  VaultPerformanceLeaderboardRow,
} from "@/types/vault-performance";
import {
  DEFAULT_PERFORMANCE_WALLET,
  getPerformanceDataset,
} from "@/server/mock-data/performance-fixtures";

const allowedSortFields = new Set<
  VaultPerformancePeersResponse["sort"]
>(["pnlPct", "pnlUsd", "depositsUsd"]);

const computePercentile = (
  value: number,
  bins: VaultPerformanceDistributionResponse["bins"]
) => {
  const total = bins.reduce((sum, bin) => sum + bin.count, 0);
  if (!total) {
    return 0;
  }

  let cumulative = 0;
  for (const bin of bins) {
    if (value >= bin.x1) {
      cumulative += bin.count;
      continue;
    }

    if (value < bin.x0) {
      break;
    }

    const span = bin.x1 - bin.x0 || 1;
    const fraction = Math.max(
      0,
      Math.min(1, (value - bin.x0) / span)
    );
    cumulative += bin.count * fraction;
    break;
  }

  return Math.min(100, Math.max(0, Math.round((cumulative / total) * 100)));
};

const createAlias = (vaultId: string, wallet: string) => {
  const input = `${vaultId}:${wallet}`;
  let hash = 0;
  for (let index = 0; index < input.length; index++) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  const normalized = (hash >>> 0).toString(16).padStart(8, "0");
  const prefix = normalized.slice(0, 4);
  const suffix = normalized.slice(-4);
  return `0x${prefix}...${suffix}`;
};

const calculatePercentile = (value: number, dataset: ReturnType<typeof getPerformanceDataset>) => {
  if (!dataset.peers.length) {
    return 0;
  }
  const belowOrEqual = dataset.peers.filter(
    (entry) => entry.metrics.pnlPct <= value
  ).length;
  return belowOrEqual / dataset.peers.length;
};

const getPeerMetrics = (vaultId: string, wallet?: string) => {
  const dataset = getPerformanceDataset(vaultId);
  const selectedWallet = wallet ?? DEFAULT_PERFORMANCE_WALLET;
  const peer =
    dataset.peers.find((entry) => entry.wallet === selectedWallet) ??
    dataset.peers.find((entry) => entry.wallet === DEFAULT_PERFORMANCE_WALLET);

  if (!peer) {
    throw new Error("Wallet not found in mock dataset");
  }

  return { dataset, peer };
};

export const mockPerformanceSummary = (
  vaultId: string,
  wallet?: string
): VaultPerformanceSummaryResponse => {
  const { dataset, peer } = getPeerMetrics(vaultId, wallet);
  return {
    your: {
      pnlUsd: peer.metrics.pnlUsd,
      pnlPct: peer.metrics.pnlPct,
      depositsUsd: peer.metrics.depositsUsd,
    },
    context: {
      utilization: dataset.context.utilization,
      feesRewards24hUsd: dataset.context.feesRewards24hUsd,
    },
    peer: {
      percentilePnLPct: calculatePercentile(peer.metrics.pnlPct, dataset),
    },
  };
};

export const mockPerformanceDistribution = (
  vaultId: string,
  wallet?: string
): VaultPerformanceDistributionResponse => {
  const { dataset, peer } = getPeerMetrics(vaultId, wallet);
  return {
    bins: dataset.bins,
    your: {
      value: peer.metrics.pnlPct,
      percentile: computePercentile(peer.metrics.pnlPct, dataset.bins),
    },
    cohortSize: dataset.cohortSize,
  };
};

export const mockPerformancePeers = (
  vaultId: string,
  options?: {
    wallet?: string;
    sort?: VaultPerformancePeersResponse["sort"];
    limit?: number;
    offset?: number;
  }
): VaultPerformancePeersResponse => {
  const { dataset } = getPeerMetrics(vaultId, options?.wallet);
  const sort = options?.sort ?? "pnlPct";
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  if (!allowedSortFields.has(sort)) {
    throw new Error(`Unsupported sort field "${sort}" in mock data`);
  }

  const sorted = [...dataset.peers]
    .map((entry) => ({
      wallet: entry.wallet,
      metrics: entry.metrics,
    }))
    .sort((a, b) => b.metrics[sort] - a.metrics[sort]);

  const rows: VaultPerformanceLeaderboardRow[] = sorted
    .map((entry, index) => ({
      rank: index + 1,
      alias: createAlias(vaultId, entry.wallet),
      pnlPct: entry.metrics.pnlPct,
      pnlUsd: entry.metrics.pnlUsd,
      depositsUsd: entry.metrics.depositsUsd,
      isYou:
        entry.wallet === (options?.wallet ?? DEFAULT_PERFORMANCE_WALLET),
    }));

  const yourRow = rows.find((row) => row.isYou);

  const paginatedRows = rows.slice(offset, offset + limit);

  return {
    total: dataset.cohortSize,
    cohortSize: dataset.cohortSize,
    rows: paginatedRows,
    sort,
    limit,
    offset,
    you: yourRow
      ? {
          rank: yourRow.rank,
          alias: yourRow.alias,
          pnlPct: yourRow.pnlPct,
          pnlUsd: yourRow.pnlUsd,
          depositsUsd: yourRow.depositsUsd,
        }
      : undefined,
  };
};
