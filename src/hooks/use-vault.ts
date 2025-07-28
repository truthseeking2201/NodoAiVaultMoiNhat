import {
  getDepositVaults,
  getEstimateDeposit,
  getEstimateWithdraw,
  getSwapDepositInfo,
  getVaultBasicDetails,
} from "@/apis";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import {
  BasicVaultDetailsType,
  DepositVaultConfig,
  SCVaultConfig,
  VaultEstimateDeposit,
  VaultEstimateWithdraw,
  VaultSwapDepositInfo,
} from "@/types/vault-config.types";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useDepositVaultStore, useVaultObjectStore } from "./use-store";
import { useWallet } from "./use-wallet";

// get vault config from SUI chain
export const useGetVaultConfig = (vaultId: string) => {
  const { data, isLoading, refetch } = useSuiClientQuery(
    "getObject",
    {
      id: vaultId,
      options: {
        showType: true,
        showContent: true,
        showDisplay: true,
      },
    },
    {
      staleTime: REFETCH_VAULT_DATA_INTERVAL,
      refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
    }
  );

  const content = data?.data?.content as unknown as {
    fields: SCVaultConfig;
  };
  return {
    vaultConfig: content?.fields,
    isLoading,
    refetch,
  };
};

export const useGetAllVaults = (vaultIds: string[]) => {
  const { data } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: vaultIds,
      options: {
        showType: true,
        showContent: true,
      },
    },
    {
      enabled: !!vaultIds.length,
      staleTime: REFETCH_VAULT_DATA_INTERVAL,
      refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
    }
  );

  const { setVaultObjects } = useVaultObjectStore();
  useEffect(() => {
    if (data) {
      const vaults = data.map((item) => {
        const content = item.data?.content as unknown as {
          fields: SCVaultConfig;
        };
        return { ...content?.fields, vault_id: item.data?.objectId };
      });
      setVaultObjects(vaults);
    }
  }, [data, setVaultObjects]);
};

export const useGetDepositVaults = () => {
  const { address } = useWallet();

  return useQuery({
    queryKey: ["deposit-vaults-data", address || "default"],
    queryFn: () => getDepositVaults(address),
    staleTime: Infinity,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<DepositVaultConfig[], Error>;
};

export const useCurrentDepositVault = () => {
  const { depositVault } = useDepositVaultStore();
  const { data } = useGetDepositVaults();
  const defaultVault = data?.find((vault) => vault.is_active) || data?.[0];
  const vault =
    data?.find((vault) => vault.vault_id === depositVault) || defaultVault;

  return {
    ...vault,
    collateral_token_symbol: vault?.collateral_token.split("::")[2],
    vault_lp_token_symbol: vault?.vault_lp_token.split("::")[2],
  } as DepositVaultConfig & {
    collateral_token_symbol: string;
    vault_lp_token_symbol: string;
  };
};

export const useVaultBasicDetails = (vaultId: string) => {
  const { address } = useWallet();
  return useQuery<BasicVaultDetailsType, Error>({
    queryKey: ["vault-basic-details", vaultId],
    queryFn: async () => {
      const response = await getVaultBasicDetails(vaultId, address);
      return response as unknown as BasicVaultDetailsType;
    },
    enabled: !!vaultId,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

export const useEstimateWithdraw = (
  vaultId: string,
  params: { ndlp_amount: string; payout_token: string }
) => {
  return useQuery<VaultEstimateWithdraw, Error>({
    queryKey: ["vault-estimate-withdraw", vaultId, params],
    queryFn: async () => {
      const response = await getEstimateWithdraw(vaultId, params);
      return response as unknown as VaultEstimateWithdraw;
    },
    enabled: !!vaultId && !!params.payout_token,
    refetchOnWindowFocus: true,
  });
};

export const useEstimateDeposit = (
  vaultId: string,
  params: { amount: string; deposit_token: string }
) => {
  const currentValue = useRef<{
    [token: string]: number;
  }>({});
  const { data, isLoading, isFetching, refetch } = useQuery<
    VaultEstimateDeposit,
    Error
  >({
    queryKey: ["vault-estimate-deposit", vaultId, params],
    queryFn: async () => {
      const response = await getEstimateDeposit(vaultId, params);
      return response as unknown as VaultEstimateDeposit;
    },
    enabled: !!vaultId && !!params?.deposit_token && !!params?.amount,
    refetchOnWindowFocus: process.env.NODE_ENV !== "development",
  });

  const isCalculating = isLoading || isFetching;

  useEffect(() => {
    if (data?.ndlp_per_deposit_rate) {
      currentValue.current[params.deposit_token] = data?.ndlp_per_deposit_rate;
    }
  }, [data, params.deposit_token]);

  return {
    data,
    rate:
      data?.ndlp_per_deposit_rate || currentValue.current[params.deposit_token],
    isCalculating,
    refetch,
  };
};

export const useSwapDepositInfo = (vaultId: string, token_address: string) => {
  return useQuery<VaultSwapDepositInfo, Error>({
    queryKey: ["vault-swap-deposit-info", vaultId, token_address],
    queryFn: async () => {
      const response = await getSwapDepositInfo(vaultId, token_address);
      return response as unknown as VaultSwapDepositInfo;
    },
    enabled: !!vaultId && !!token_address,
  });
};
