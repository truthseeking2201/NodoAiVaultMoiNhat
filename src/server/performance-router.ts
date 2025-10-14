/// <reference types="node" />
import { Router } from "express";
import crypto from "node:crypto";

import {
  MIN_PERFORMANCE_COHORT,
  VaultPerformanceDistributionResponse,
  VaultPerformancePeersResponse,
  VaultPerformanceLeaderboardRow,
  VaultPerformanceSummaryResponse,
} from "@/types/vault-performance";
import {
  DEFAULT_PERFORMANCE_WALLET,
  getPerformanceDataset,
} from "./mock-data/performance-fixtures";

const PERFORMANCE_ALIAS_PEPPER =
  process.env.PERFORMANCE_ALIAS_PEPPER ?? "nodo-demo-pepper";

const createAlias = (vaultId: string, wallet: string) => {
  const hmac = crypto.createHmac("sha256", PERFORMANCE_ALIAS_PEPPER);
  hmac.update(`${vaultId}:${wallet}`);
  const digest = hmac.digest("hex");
  const prefix = digest.slice(0, 4);
  const suffix = digest.slice(-4);
  return `0x${prefix}...${suffix}`;
};

const allowedSortFields = new Set<
  VaultPerformancePeersResponse["sort"]
>(["pnlPct", "pnlUsd", "depositsUsd"]);
const allowedWindows = new Set<VaultPerformanceDistributionResponse["window"]>([
  "all",
  "1d",
  "1w",
]);

type DatasetPeer = ReturnType<typeof getPerformanceDataset>["peers"][number];

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

const formatBinEdge = (value: number) =>
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
        x0: formatBinEdge(x0),
        x1: formatBinEdge(x1),
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
    x0: formatBinEdge(bin.x0),
    x1: formatBinEdge(bin.x1),
    count: bin.count,
  }));
};

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

export const createPerformanceRouter = () => {
  const router = Router();

  router.get(
    "/api/v1/vaults/:vaultId/perf/summary",
    (request, response) => {
      const { vaultId } = request.params;
      const wallet =
        (request.query.wallet as string | undefined) ??
        DEFAULT_PERFORMANCE_WALLET;

      const dataset = getPerformanceDataset(vaultId);
      const peer =
        dataset.peers.find((item) => item.wallet === wallet) ??
        dataset.peers.find(
          (item) => item.wallet === DEFAULT_PERFORMANCE_WALLET
        );

      if (!peer) {
        response.status(404).json({
          message: "Wallet not found for the requested vault.",
        });
        return;
      }

      const percentileAllTime =
        percentileFromValues(
          peer.metrics.pnlUsd,
          dataset.peers
            .map((entry) => entry.metrics.pnlUsd)
            .filter((value) => Number.isFinite(value))
        ) ?? 0;

      const summary: VaultPerformanceSummaryResponse = {
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
          percentilePnlUsd: percentileAllTime,
        },
      };

      response.json(summary);
    }
  );

  router.get(
    "/api/v1/vaults/:vaultId/perf/distribution",
    (request, response) => {
      const { vaultId } = request.params;
      const metric = (request.query.metric as string) ?? "pnlUsd";
      const wallet =
        (request.query.wallet as string | undefined) ??
        DEFAULT_PERFORMANCE_WALLET;
      const windowParam =
        (request.query.window as string | undefined) ?? "all";
      const binsParam = Number.parseInt(
        (request.query.bins as string) ?? "30",
        10
      );

      if (metric !== "pnlUsd") {
        response.status(400).json({
          message: "Only pnlUsd distribution is supported.",
        });
        return;
      }

      if (!allowedWindows.has(windowParam as typeof windowParam)) {
        response.status(400).json({
          message: `Unsupported window "${windowParam}".`,
        });
        return;
      }

      const binCount = Number.isFinite(binsParam)
        ? Math.max(5, Math.min(120, binsParam))
        : 30;

      const windowKey =
        windowParam as VaultPerformanceDistributionResponse["window"];

      const dataset = getPerformanceDataset(vaultId);
      const peer =
        dataset.peers.find((item) => item.wallet === wallet) ??
        dataset.peers.find(
          (item) => item.wallet === DEFAULT_PERFORMANCE_WALLET
        );

      if (!peer) {
        response.status(404).json({
          message: "Wallet not found for the requested vault.",
        });
        return;
      }

      const values = dataset.peers
        .map((entry) => getWindowValue(entry, windowKey))
        .filter((value): value is number => value != null && Number.isFinite(value));
      const yourValue = getWindowValue(peer, windowKey);
      const percentile = percentileFromValues(yourValue, values);

      const distribution: VaultPerformanceDistributionResponse = {
        metric: "pnlUsd",
        window: windowKey,
        bins: createHistogram(values, binCount),
        your: {
          value: yourValue ?? null,
          percentile,
        },
        cohortSize: dataset.cohortSize,
        peers: {
          size: values.length,
        },
      };

      response.json(distribution);
    }
  );

  router.get(
    "/api/v1/vaults/:vaultId/perf/peers",
    (request, response) => {
      const { vaultId } = request.params;
      const sort =
        ((request.query.sort as string) ??
          "pnlPct") as VaultPerformancePeersResponse["sort"];
      const limit = Math.max(
        1,
        Math.min(
          100,
          Number.parseInt((request.query.limit as string) ?? "20", 10)
        )
      );
      const offset = Math.max(
        0,
        Number.parseInt((request.query.offset as string) ?? "0", 10)
      );
      const wallet =
        (request.query.wallet as string | undefined) ??
        DEFAULT_PERFORMANCE_WALLET;

      if (!allowedSortFields.has(sort)) {
        response.status(400).json({
          message: `Unsupported sort field "${sort}".`,
        });
        return;
      }

      const dataset = getPerformanceDataset(vaultId);
      const rows = dataset.peers
        .map((peer) => ({
          wallet: peer.wallet,
          metrics: peer.metrics,
        }))
        .sort((a, b) => {
          const left = a.metrics[sort];
          const right = b.metrics[sort];
          return right - left;
        });

      const mappedRows: VaultPerformanceLeaderboardRow[] = rows.map(
        (entry, index) => ({
          rank: index + 1,
          alias: createAlias(vaultId, entry.wallet),
          pnlPct: entry.metrics.pnlPct,
          pnlUsd: entry.metrics.pnlUsd,
          depositsUsd: entry.metrics.depositsUsd,
          isYou: entry.wallet === wallet,
        })
      );

      const paginatedRows = mappedRows.slice(offset, offset + limit);
      const yourRow = mappedRows.find((row) => row.isYou);

      const payload: VaultPerformancePeersResponse = {
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

      response.json(payload);
    }
  );

  router.get("/api/v1/vaults/:vaultId/perf/status", (request, response) => {
    const { vaultId } = request.params;
    const dataset = getPerformanceDataset(vaultId);
    response.json({
      cohortSize: dataset.cohortSize,
      meetsMinimum: dataset.cohortSize >= MIN_PERFORMANCE_COHORT,
    });
  });

  return router;
};
