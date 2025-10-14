import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  VaultPerformanceDistributionResponse,
  VaultPerformancePeersResponse,
  VaultPerformanceSummaryResponse,
} from "@/types/vault-performance";
import {
  getVaultPerformanceSummary,
  getVaultPerformanceDistribution,
  getVaultPerformancePeers,
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
  vaultId?: string,
  options?: {
    window?: VaultPerformanceDistributionResponse["window"];
    bins?: number;
  }
): UseQueryResult<VaultPerformanceDistributionResponse, Error> => {
  const { address, isAuthenticated } = useWallet();
  const walletAddress = getWalletAddressForPerformance(address);

  return useQuery({
    queryKey: [
      "vault-performance-distribution",
      vaultId,
      walletAddress,
      options?.window ?? "all",
      options?.bins ?? 30,
    ],
    queryFn: () =>
      getVaultPerformanceDistribution(vaultId as string, {
        wallet: walletAddress,
        window: options?.window,
        bins: options?.bins,
      }),
    enabled:
      !!vaultId &&
      (!!walletAddress || !!address) &&
      (isMockMode || isAuthenticated),
    staleTime: 60000,
    refetchInterval: 120000,
  }) as UseQueryResult<VaultPerformanceDistributionResponse, Error>;
};

export const useVaultPerformancePeers = (
  vaultId?: string,
  options?: {
    sort?: VaultPerformancePeersResponse["sort"];
    limit?: number;
    offset?: number;
  }
): UseQueryResult<VaultPerformancePeersResponse, Error> => {
  const { address, isAuthenticated } = useWallet();
  const walletAddress = getWalletAddressForPerformance(address);

  return useQuery({
    queryKey: [
      "vault-performance-peers",
      vaultId,
      walletAddress,
      options?.sort ?? "pnlPct",
      options?.limit ?? 20,
      options?.offset ?? 0,
    ],
    queryFn: () =>
      getVaultPerformancePeers(vaultId as string, {
        wallet: walletAddress,
        sort: options?.sort ?? "pnlPct",
        limit: options?.limit ?? 20,
        offset: options?.offset ?? 0,
      }),
    enabled:
      !!vaultId &&
      (!!walletAddress || !!address) &&
      (isMockMode || isAuthenticated),
    staleTime: 60000,
    refetchInterval: 120000,
  }) as UseQueryResult<VaultPerformancePeersResponse, Error>;
};
