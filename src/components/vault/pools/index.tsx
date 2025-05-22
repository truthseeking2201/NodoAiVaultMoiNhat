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
      tokens: ["CETUS", "SUI"],
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
        {!isLoadingVaultManagement
          ? pools.map((pool, index) => <VaultCard pool={pool} key={index} />)
          : [1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="w-[calc(100%/3-0.5rem)] h-[200px] bg-black/50 animate-pulse rounded-lg flex flex-col justify-between p-4"
              >
                <div className="h-6 bg-white/20 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-1/4"></div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default VaultPools;
