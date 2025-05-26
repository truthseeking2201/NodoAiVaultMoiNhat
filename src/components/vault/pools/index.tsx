import { useCurrentDepositVault, useGetDepositVaults } from "@/hooks";
import { useUSDCLPRate } from "@/hooks/useDepositVault";
import { useMyAssets } from "@/hooks/useMyAssets";
import { useMemo } from "react";
import VaultCard from "./Card";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

const VaultPools = () => {
  const { data: depositVaults } = useGetDepositVaults();
  const currentVault = useCurrentDepositVault();
  const account = useCurrentAccount();

  // const ndlpAmount = assets.find(
  //   (asset) => asset.coin_type === currentVault.vault_lp_token
  // )?.balance;

  // const conversionRate = useUSDCLPRate(true);
  // const userHolding = ndlpAmount * conversionRate;

  const pools = useMemo(() => {
    return depositVaults.map((vault) => ({
      id: vault.vault_id,
      tokens: vault.vault_name.split(" - "),
      APR: vault.apr,
      holding: 0, // todo
      isLive: vault.is_active,
      isComingSoon: false,
      vault_lp_token: vault.vault_lp_token,
      vault_lp_token_decimals: vault.vault_lp_token_decimals,
    }));
  }, [depositVaults]);

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
