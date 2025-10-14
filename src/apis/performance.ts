import http from "@/utils/http";
import { isMockMode } from "@/config/mock";
import {
  VaultPerformanceSummaryResponse,
  VaultPerformanceDistributionResponse,
  VaultPerformancePeersResponse,
} from "@/types/vault-performance";
import {
  mockPerformanceSummary,
  mockPerformanceDistribution,
  mockPerformancePeers,
} from "@/mocks";

const URLS = {
  summary: (vaultId: string) => `/api/v1/vaults/${vaultId}/perf/summary`,
  distribution: (vaultId: string) =>
    `/api/v1/vaults/${vaultId}/perf/distribution`,
  peers: (vaultId: string) =>
    `/api/v1/vaults/${vaultId}/perf/peers`,
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
  options?: {
    wallet?: string;
    window?: VaultPerformanceDistributionResponse["window"];
    bins?: number;
  }
): Promise<VaultPerformanceDistributionResponse> => {
  if (isMockMode) {
    return mockPerformanceDistribution(vaultId, options);
  }

  return http.get(URLS.distribution(vaultId), {
    params: {
      metric: "pnlUsd",
      window: options?.window ?? "all",
      bins: options?.bins ?? 30,
      ...(options?.wallet ? { wallet: options.wallet } : {}),
    },
  }) as Promise<VaultPerformanceDistributionResponse>;
};

export const getVaultPerformancePeers = async (
  vaultId: string,
  options?: {
    wallet?: string;
    sort?: VaultPerformancePeersResponse["sort"];
    limit?: number;
    offset?: number;
  }
): Promise<VaultPerformancePeersResponse> => {
  if (isMockMode) {
    return mockPerformancePeers(vaultId, options);
  }

  return http.get(URLS.peers(vaultId), {
    params: {
      sort: options?.sort ?? "pnlPct",
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
      ...(options?.wallet ? { wallet: options.wallet } : {}),
    },
  }) as Promise<VaultPerformancePeersResponse>;
};
