import { useCurrentDepositVault, useGetDepositVaults } from "@/hooks";
import { useMemo } from "react";
import VaultCard from "./Card";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";

export type VaultPool = {
  vault_id: string;
  tokens: string[];
  APR: number;
  isLive: boolean;
  vault_lp_token: string;
  vault_lp_token_decimals: number;
  isSelected: boolean;
  exchange_id: number;
};

const VaultPools = () => {
  const { data: depositVaults } = useGetDepositVaults();
  const currentVault = useCurrentDepositVault();

  const pools = useMemo(() => {
    return depositVaults.map((vault) => ({
      vault_id: vault.vault_id,
      tokens: vault.pool.pool_name.split("-"),
      APR: vault.apr,
      isLive: vault.is_active,
      vault_lp_token: vault.vault_lp_token,
      vault_lp_token_decimals: vault.vault_lp_token_decimals,
      isSelected: vault.vault_id === currentVault.vault_id,
      exchange_id: vault.metadata.exchange_id,
    }));
  }, [depositVaults, currentVault]);

  return (
    <div>
      <div className="font-md font-semibold">Select a Vault</div>
      <div className="grid grid-cols-3 gap-6 mt-[10px]">
        {pools.map((pool, index) => (
          <VaultCard pool={pool} key={index} />
        ))}
      </div>
    </div>
  );
};

export default VaultPools;
