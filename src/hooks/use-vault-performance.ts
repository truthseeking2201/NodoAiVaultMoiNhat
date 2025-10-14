import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  VaultPerformanceDistributionResponse,
  VaultPerformanceLeaderboardResponse,
  VaultPerformanceSummaryResponse,
} from "@/types/vault-performance";
import {
  getVaultPerformanceSummary,
  getVaultPerformanceDistribution,
  getVaultPerformanceLeaderboard,
} from "@/apis";
import { useWallet } from "./use-wallet";
import { isMockMode } from "@/config/mock";
import { DEFAULT_PERFORMANCE_WALLET } from "@/server/mock-data/performance-fixtures";

const getWalletAddressForPerformance = (address?: string | null) => {
  if (isMockMode) {
    return address ?? DEFAULT_PERFORMANCE_WALLET;
  }
  return address ?? undefined;
};

export const useVaultPerformanceSummary = (
  vaultId?: string
): UseQueryResult<VaultPerformanceSummaryResponse, Error> => {
  const { address, isAuthenticated } = useWallet();
  const walletAddress = getWalletAddressForPerformance(address);

  return useQuery({
    queryKey: ["vault-performance-summary", vaultId, walletAddress],
    queryFn: () =>
      getVaultPerformanceSummary(vaultId as string, walletAddress),
    enabled:
      !!vaultId &&
      (!!walletAddress || !!address) &&
      (isMockMode || isAuthenticated),
    staleTime: 60000,
    refetchInterval: 120000,
  }) as UseQueryResult<VaultPerformanceSummaryResponse, Error>;
};

export const useVaultPerformanceDistribution = (
  vaultId?: string
): UseQueryResult<VaultPerformanceDistributionResponse, Error> => {
  const { address, isAuthenticated } = useWallet();
  const walletAddress = getWalletAddressForPerformance(address);

  return useQuery({
    queryKey: ["vault-performance-distribution", vaultId, walletAddress],
    queryFn: () =>
      getVaultPerformanceDistribution(vaultId as string, walletAddress),
    enabled:
      !!vaultId &&
      (!!walletAddress || !!address) &&
      (isMockMode || isAuthenticated),
    staleTime: 60000,
    refetchInterval: 120000,
  }) as UseQueryResult<VaultPerformanceDistributionResponse, Error>;
};

export const useVaultPerformanceLeaderboard = (
  vaultId?: string,
  options?: {
    sort?: VaultPerformanceLeaderboardResponse["sort"];
    limit?: number;
  }
): UseQueryResult<VaultPerformanceLeaderboardResponse, Error> => {
  const { address, isAuthenticated } = useWallet();
  const walletAddress = getWalletAddressForPerformance(address);

  return useQuery({
    queryKey: [
      "vault-performance-leaderboard",
      vaultId,
      walletAddress,
      options?.sort ?? "pnlPct",
      options?.limit ?? 100,
    ],
    queryFn: () =>
      getVaultPerformanceLeaderboard(vaultId as string, {
        wallet: walletAddress,
        sort: options?.sort ?? "pnlPct",
        limit: options?.limit ?? 100,
      }),
    enabled:
      !!vaultId &&
      (!!walletAddress || !!address) &&
      (isMockMode || isAuthenticated),
    staleTime: 60000,
    refetchInterval: 120000,
  }) as UseQueryResult<VaultPerformanceLeaderboardResponse, Error>;
};
