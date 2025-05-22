import { useGetVaultManagement } from "@/hooks";
import VaultCard from "./Card";
import { useEffect, useState } from "react";

const VaultPools = () => {
  const {
    data: vaultManagement,
    isLoading: isLoadingVaultManagement,
    refetch: refetchVaultManagement,
  } = useGetVaultManagement();
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
  const [pools, SetPools] = useState(initialPools);

  useEffect(() => {
    if (!isLoadingVaultManagement) {
      const vaultId = vaultManagement?.id || -1;
      SetPools((prevPools) => {
        const updatedPools = prevPools.map((p) => {
          if (p.id === Number(vaultId)) {
            return {
              ...p,
              APR: vaultManagement.apr,
            };
          }
          return p;
        });
        return updatedPools;
      });
    }
  }, [isLoadingVaultManagement]);

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
