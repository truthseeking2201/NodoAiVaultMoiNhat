import { getDepositVaults } from "@/apis/vault";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { VAULT_CONFIG } from "@/config/vault-config";
import { DepositVaultConfig, VaultConfig } from "@/types/vault-config.types";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useDepositVaultStore } from "./useStore";

export const useGetVaultConfig = (vaultId?: string) => {
  const { data, isLoading, refetch } = useSuiClientQuery(
    "getObject",
    {
      id: vaultId || VAULT_CONFIG.VAULT_ID,
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

export const useGetDepositVaults = () => {
  return useQuery({
    queryKey: ["deposit-vaults-data"],
    queryFn: () => getDepositVaults(),
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
  }) as UseQueryResult<DepositVaultConfig[], Error>;
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
  return data?.find((vault) => vault.vault_id === depositVault) || defaultVault;
};
