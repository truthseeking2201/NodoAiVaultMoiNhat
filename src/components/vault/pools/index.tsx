import { COIN_TYPES_CONFIG } from "@/config/coin-config";
import { useGetVaultManagement } from "@/hooks";
import { useUSDCLPRate } from "@/hooks/useDepositVault";
import { useMyAssets } from "@/hooks/useMyAssets";
import { useMemo } from "react";
import VaultCard from "./Card";

const VaultPools = () => {
  const { data: vaultManagement, isLoading: isLoadingVaultManagement } =
    useGetVaultManagement();

  const { isLoading: isLoadingNDLPCoin, assets } = useMyAssets();

  const ndlpAmount = assets.find(
    (asset) => asset.coin_type === COIN_TYPES_CONFIG.NDLP_COIN_TYPE
  )?.balance;

  const conversionRate = useUSDCLPRate(true);
  const userHolding = ndlpAmount * conversionRate;

  const initialPools = [
    {
      id: 1,
      tokens: ["DEEP", "SUI"],
      APR: 0,
      holding: 0,
      isLive: true,
      isComingSoon: false,
    },
    {
      id: 2,
      tokens: ["WAL", "SUI"],
      APR: 0,
      holding: 0,
      isLive: false,
      isComingSoon: true,
    },
    {
      id: 3,
      tokens: ["USDC", "SUI"],
      APR: 0,
      holding: 0,
      isLive: false,
      isComingSoon: true,
    },
  ];

  const pools = useMemo(() => {
    const vaultId = vaultManagement?.id || -1;

    if (isLoadingVaultManagement || isLoadingNDLPCoin) {
      return initialPools;
    }
    return initialPools.map((p) => {
      if (p.id === Number(vaultId)) {
        return {
          ...p,
          APR: vaultManagement.apr || 0,
          holding: userHolding || 0,
        };
      }
      return p;
    });
  }, [
    isLoadingVaultManagement,
    isLoadingNDLPCoin,
    vaultManagement,
    userHolding,
  ]);

  return (
    <div>
      <div className="font-md font-semibold">Select a Vault</div>
      <div className="flex gap-6 mt-[10px]">
        {pools.map((pool, index) => <VaultCard pool={pool} key={index} />)}
      </div>
    </div>
  );
};

export default VaultPools;
