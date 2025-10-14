/// <reference types="node" />
import { Router } from "express";
import crypto from "node:crypto";

import {
  MIN_PERFORMANCE_COHORT,
  VaultPerformanceDistributionResponse,
  VaultPerformanceLeaderboardResponse,
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
  VaultPerformanceLeaderboardResponse["sort"]
>(["pnlPct", "pnlUsd", "depositsUsd", "withdrawalsUsd", "currentValueUsd"]);

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

      const summary: VaultPerformanceSummaryResponse = {
        your: peer.metrics,
        context: dataset.context,
        cohortSize: dataset.cohortSize,
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
    "/api/v1/vaults/:vaultId/perf/leaderboard",
    (request, response) => {
      const { vaultId } = request.params;
      const sort =
        ((request.query.sort as string) ??
          "pnlPct") as VaultPerformanceLeaderboardResponse["sort"];
      const limit = Math.max(
        1,
        Math.min(
          500,
          Number.parseInt((request.query.limit as string) ?? "100", 10)
        )
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

      const leaderboard: VaultPerformanceLeaderboardRow[] = rows.map(
        (entry, index) => {
          const isYou = entry.wallet === wallet;
          const alias = createAlias(vaultId, entry.wallet);

          return {
            rank: index + 1,
            alias,
            pnlPct: entry.metrics.pnlPct,
            pnlUsd: entry.metrics.pnlUsd,
            depositsUsd: entry.metrics.depositsUsd,
            withdrawalsUsd: entry.metrics.withdrawalsUsd,
            currentValueUsd: entry.metrics.currentValueUsd,
            isYou,
          };
        }
      );

      let visibleRows = leaderboard.slice(0, limit);
      const yourRow = leaderboard.find((row) => row.isYou);

      if (
        yourRow &&
        !visibleRows.some((row) => row.isYou)
      ) {
        visibleRows = [...visibleRows, yourRow];
      }

      const payload: VaultPerformanceLeaderboardResponse = {
        rows: visibleRows,
        sort,
        cohortSize: dataset.cohortSize,
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
