import {
  useCurrentDepositVault,
  useGetDepositVaults,
  useMyAssets,
} from "@/hooks";
import { useMemo } from "react";
import VaultCard from "./Card";

export type VaultPool = {
  vault_id: string;
  tokens: string[];
  APR: number;
  holding: number;
  isLive: boolean;
  vault_lp_token: string;
  vault_lp_token_decimals: number;
  isSelected: boolean;
};

const VaultPools = () => {
  const { data: depositVaults } = useGetDepositVaults();
  const currentVault = useCurrentDepositVault();

  const pools = useMemo(() => {
    return depositVaults.map((vault) => ({
      vault_id: vault.vault_id,
      tokens: vault.vault_name.split(" - "),
      APR: vault.apr,
      holding: 0, // todo
      isLive: vault.is_active,
      vault_lp_token: vault.vault_lp_token,
      vault_lp_token_decimals: vault.vault_lp_token_decimals,
      isSelected: vault.vault_id === currentVault.vault_id,
    }));
  }, [depositVaults, currentVault]);

  return (
    <div>
      <div className="font-md font-semibold">Select a Vault</div>
      <div className="flex gap-6 mt-[10px]">
        {pools.map((pool, index) => (
          <VaultCard pool={pool} key={index} />
        ))}
      </div>
    </div>
  );
  return null;
};

export default VaultPools;
