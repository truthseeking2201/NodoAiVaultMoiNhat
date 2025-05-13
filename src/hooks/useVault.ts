import { getVaultConfig } from "@/apis/vault";
import { VAULT_CONFIG } from "@/config/vault-config";
import { VaultConfig } from "@/types/vault-config.types";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

export const useGetVaultConfig = (vaultId?: string) => {
  const { data, isLoading } = useSuiClientQuery(
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
      refetchInterval: 30000,
    }
  );

  const content = data?.data?.content as unknown as {
    fields: VaultConfig;
  };
  return {
    vaultConfig: content?.fields,
    isLoading,
  };
};

export const useGetVaultManagement = () => {
  const vaultId =
    "0x64296a09c8babdfc9e82bbc5223211334b67ac82119393c34345ba5c336a9b05"; // /VAULT_CONFIG.VAULT_ID;

  return useQuery({
    queryKey: ["vault-management-data"],
    queryFn: () => getVaultConfig(vaultId),
    refetchInterval: 30000,
  }) as UseQueryResult<
    {
      apr: number;
      total_users: number;
    },
    Error
  >;
};
