import { getDepositVaults } from "@/apis";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { DepositVaultConfig, VaultConfig } from "@/types/vault-config.types";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useDepositVaultStore } from "./useStore";
import { useEffect, useState } from "react";
import { sleep } from "@/lib/utils";

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
    fields: VaultConfig;
  };
  return {
    vaultConfig: content?.fields,
    isLoading,
    refetch,
  };
};

export const useGetDepositVaults = (lastAddress?: string) => {
  const account = useCurrentAccount();
  const address = account?.address || lastAddress;
  const [enabledDefaultQuery, setEnabledDefaultQuery] = useState(!address);

  const addressQuery = useQuery({
    queryKey: ["deposit-vaults-data", address],
    queryFn: () => getDepositVaults(address),
    staleTime: REFETCH_VAULT_DATA_INTERVAL + 5000,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
    enabled: !!address,
  }) as UseQueryResult<DepositVaultConfig[], Error>;

  const defaultQuery = useQuery({
    queryKey: ["deposit-vaults-data", "default"],
    queryFn: () => getDepositVaults(),
    staleTime: REFETCH_VAULT_DATA_INTERVAL + 5000,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
    enabled: enabledDefaultQuery,
  });

  useEffect(() => {
    if (addressQuery.data) {
      sleep(1000).then(() => setEnabledDefaultQuery(true));
    }
  }, [addressQuery.data, address]);

  return address && addressQuery.data ? addressQuery : defaultQuery;
};

export const useGetDepositVaultById = (vaultId?: string) => {
  const { data } = useGetDepositVaults();
  if (!vaultId) return null;
  return data?.find((vault) => vault.vault_id === vaultId);
};

export const useCurrentDepositVault = () => {
  const { depositVault } = useDepositVaultStore();
  const { data } = useGetDepositVaults();
  const defaultVault = data?.find((vault) => vault.is_active);
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
