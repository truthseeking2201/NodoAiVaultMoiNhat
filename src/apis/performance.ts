import http from "@/utils/http";
import { isMockMode } from "@/config/mock";
import {
  VaultPerformanceSummaryResponse,
  VaultPerformanceDistributionResponse,
  VaultPerformanceLeaderboardResponse,
} from "@/types/vault-performance";
import {
  mockPerformanceSummary,
  mockPerformanceDistribution,
  mockPerformanceLeaderboard,
} from "@/mocks";

const URLS = {
  summary: (vaultId: string) => `/api/v1/vaults/${vaultId}/perf/summary`,
  distribution: (vaultId: string) =>
    `/api/v1/vaults/${vaultId}/perf/distribution`,
  leaderboard: (vaultId: string) =>
    `/api/v1/vaults/${vaultId}/perf/leaderboard`,
};

export const getVaultPerformanceSummary = async (
  vaultId: string,
  wallet?: string
): Promise<VaultPerformanceSummaryResponse> => {
  if (isMockMode) {
    return mockPerformanceSummary(vaultId, wallet);
  }

  return http.get(URLS.summary(vaultId), {
    params: wallet ? { wallet } : undefined,
  }) as Promise<VaultPerformanceSummaryResponse>;
};

export const getVaultPerformanceDistribution = async (
  vaultId: string,
  wallet?: string
): Promise<VaultPerformanceDistributionResponse> => {
  if (isMockMode) {
    return mockPerformanceDistribution(vaultId, wallet);
  }

  return http.get(URLS.distribution(vaultId), {
    params: {
      metric: "pnlPct",
      ...(wallet ? { wallet } : {}),
    },
  }) as Promise<VaultPerformanceDistributionResponse>;
};

export const getVaultPerformanceLeaderboard = async (
  vaultId: string,
  options?: {
    wallet?: string;
    sort?: VaultPerformanceLeaderboardResponse["sort"];
    limit?: number;
  }
): Promise<VaultPerformanceLeaderboardResponse> => {
  if (isMockMode) {
    return mockPerformanceLeaderboard(vaultId, options);
  }

  return http.get(URLS.leaderboard(vaultId), {
    params: {
      sort: options?.sort ?? "pnlPct",
      limit: options?.limit ?? 100,
      ...(options?.wallet ? { wallet: options.wallet } : {}),
    },
  }) as Promise<VaultPerformanceLeaderboardResponse>;
};
