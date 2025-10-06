import { useMemo } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { useGetLpToken } from "@/hooks";
import { useWallet } from "@/hooks/use-wallet";
import StreakCard from "@/features/streak-vault/ui/StreakCard";
import { BasicVaultDetailsType } from "@/types/vault-config.types";

type VaultStreakProps = {
  vaultId?: string;
  vault?: BasicVaultDetailsType;
  isDetailLoading: boolean;
};

const VaultStreak = ({ vaultId, vault, isDetailLoading }: VaultStreakProps) => {
  const { address, isAuthenticated } = useWallet();
  const safeVaultId = vaultId ?? "";

  const lpToken = useGetLpToken(vault?.vault_lp_token ?? "", safeVaultId);

  const hasNDLP = useMemo(
    () => Number(lpToken?.balance ?? 0) > 0,
    [lpToken?.balance]
  );

  const wallet = isAuthenticated ? address : undefined;

  if (!vaultId) {
    return null;
  }

  return (
    <DetailWrapper
      title="Streak Tracker"
      isLoading={isDetailLoading}
      loadingStyle="h-[220px] w-full"
    >
      <StreakCard
        variant="embedded"
        vaultId={safeVaultId}
        wallet={wallet}
        hasNDLP={hasNDLP}
      />
    </DetailWrapper>
  );
};

export default VaultStreak;
