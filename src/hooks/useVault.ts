import { getVaultConfig } from "@/apis/vault";
import { REFETCH_VAULT_DATA_INTERVAL } from "@/config/constants";
import { PROD_VAULT_ID, VAULT_CONFIG } from "@/config/vault-config";
import { VaultConfig } from "@/types/vault-config.types";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

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

export const useGetVaultManagement = () => {
  const vaultId = PROD_VAULT_ID;

  return useQuery({
    queryKey: ["vault-management-data"],
    queryFn: () => getVaultConfig(vaultId),
    staleTime: REFETCH_VAULT_DATA_INTERVAL,
    refetchInterval: REFETCH_VAULT_DATA_INTERVAL,
  }) as UseQueryResult<
    {
      apr: number;
      total_users: number;
    },
    Error
  >;
};
