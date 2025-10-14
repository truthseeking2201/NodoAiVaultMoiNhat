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
const allowedWindows = new Set<VaultPerformanceDistributionResponse["window"]>([
  "all",
  "1d",
  "1w",
]);

const percentileFromValues = (
  value: number | null | undefined,
  values: number[]
) => {
  if (value == null || !Number.isFinite(value) || values.length === 0) {
    return null;
  }
  const belowOrEqual = values.filter((item) => item <= value).length;
  return belowOrEqual / values.length;
};

const formatEdge = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(2)) : value;

const createHistogram = (
  values: number[],
  binCount: number
): VaultPerformanceDistributionResponse["bins"] => {
  if (!values.length || binCount <= 0) {
    return [];
  }

  const finiteValues = values.filter((value) =>
    Number.isFinite(value)
  );
  if (!finiteValues.length) {
    return [];
  }

  const min = Math.min(...finiteValues);
  const max = Math.max(...finiteValues);
  const span = max - min;

  if (span === 0) {
    const width = Math.max(1, Math.abs(min) * 0.1 || 1);
    const start = min - (width * binCount) / 2;
    return Array.from({ length: binCount }, (_, index) => {
      const x0 = start + width * index;
      const x1 = x0 + width;
      const count = finiteValues.filter((value) => {
        if (index === binCount - 1) {
          return value >= x0 && value <= x1;
        }
        return value >= x0 && value < x1;
      }).length;
      return {
        x0: formatEdge(x0),
        x1: formatEdge(x1),
        count,
      };
    });
  }

  const padding = span * 0.05;
  const minEdge = min - padding;
  const maxEdge = max + padding;
  const width = (maxEdge - minEdge) / binCount;

  const bins = Array.from({ length: binCount }, (_, index) => ({
    x0: minEdge + width * index,
    x1: minEdge + width * (index + 1),
    count: 0,
  }));

  for (const value of finiteValues) {
    const relative = value - minEdge;
    const index = Math.min(
      binCount - 1,
      Math.max(0, Math.floor(relative / width))
    );
    bins[index].count += 1;
  }

  return bins.map((bin) => ({
    x0: formatEdge(bin.x0),
    x1: formatEdge(bin.x1),
    count: bin.count,
  }));
};

type DatasetPeer = ReturnType<typeof getPerformanceDataset>["peers"][number];

const getWindowValue = (
  peer: DatasetPeer,
  window: VaultPerformanceDistributionResponse["window"]
) => {
  const history = peer.history?.pnlUsd;
  if (!history) {
    return null;
  }
  const now = history.now ?? peer.metrics.pnlUsd;
  if (!Number.isFinite(now)) {
    return null;
  }
  if (window === "all") {
    return now;
  }
  if (window === "1d") {
    if (history.d1 == null) {
      return null;
    }
    return now - history.d1;
  }
  if (history.d7 == null) {
    return null;
  }
  return now - history.d7;
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
  const percentileUsd =
    percentileFromValues(
      peer.metrics.pnlUsd,
      dataset.peers
        .map((entry) => entry.metrics.pnlUsd)
        .filter((value) => Number.isFinite(value))
    ) ?? 0;
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
      percentilePnlUsd: percentileUsd,
    },
  };
};

export const mockPerformanceDistribution = (
  vaultId: string,
  options?: {
    wallet?: string;
    window?: VaultPerformanceDistributionResponse["window"];
    bins?: number;
  }
): VaultPerformanceDistributionResponse => {
  const windowKey =
    options?.window && allowedWindows.has(options.window)
      ? options.window
      : "all";
  const { dataset, peer } = getPeerMetrics(vaultId, options?.wallet);
  const peerValues = dataset.peers
    .map((entry) => getWindowValue(entry, windowKey))
    .filter((value): value is number => value != null && Number.isFinite(value));
  const yourValue = getWindowValue(peer, windowKey);
  const bins = createHistogram(peerValues, options?.bins ?? 30);
  return {
    metric: "pnlUsd",
    window: windowKey,
    bins,
    your: {
      value: yourValue ?? null,
      percentile: percentileFromValues(yourValue, peerValues),
    },
    cohortSize: dataset.cohortSize,
    peers: {
      size: peerValues.length,
    },
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
