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

const calculatePercentile = (
  value: number,
  peers: Array<{ metrics: { pnlPct: number } }>
) => {
  if (!peers.length) {
    return 0;
  }

  const belowOrEqual = peers.filter(
    (peer) => peer.metrics.pnlPct <= value
  ).length;

  return belowOrEqual / peers.length;
};

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

const allowedSortFields = new Set<
  VaultPerformancePeersResponse["sort"]
>(["pnlPct", "pnlUsd", "depositsUsd"]);

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

      const percentile = calculatePercentile(
        peer.metrics.pnlPct,
        dataset.peers
      );

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
          percentilePnLPct: percentile,
        },
      };

      response.json(summary);
    }
  );

  router.get(
    "/api/v1/vaults/:vaultId/perf/distribution",
    (request, response) => {
      const { vaultId } = request.params;
      const metric = (request.query.metric as string) ?? "pnlPct";
      const wallet =
        (request.query.wallet as string | undefined) ??
        DEFAULT_PERFORMANCE_WALLET;

      if (metric !== "pnlPct") {
        response.status(400).json({
          message: "Only pnlPct distribution is supported in phase 1.",
        });
        return;
      }

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

      const percentile = computePercentile(peer.metrics.pnlPct, dataset.bins);
      const distribution: VaultPerformanceDistributionResponse = {
        bins: dataset.bins,
        your: {
          value: peer.metrics.pnlPct,
          percentile,
        },
        cohortSize: dataset.cohortSize,
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
