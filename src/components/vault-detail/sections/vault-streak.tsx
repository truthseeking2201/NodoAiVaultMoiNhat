import { useEffect, useMemo } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { useGetLpToken } from "@/hooks";
import { useWallet } from "@/hooks/use-wallet";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { StreakTrackerCard } from "@/components/streak/StreakTrackerCard";
import { useStreak } from "@/features/streak-vault/hooks/use-streak";
import { utcDayKey } from "@/features/streak-vault/logic";
import type { StreakReward } from "@/features/streak-vault/types";
import { dispatchMissionDepositPrefill } from "@/lib/mission-events";

type VaultStreakProps = {
  vaultId?: string;
  vault?: BasicVaultDetailsType;
  isDetailLoading: boolean;
};

const DEFAULT_REWARD_MAP: Record<number, number> = {
  1: 100,
  3: 300,
  7: 1_000,
  14: 2_400,
  30: 6_000,
};

const getMsUntilNextUtcMidnight = () => {
  const now = new Date();
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  return Math.max(0, next - now.getTime());
};

const resolveMilestones = (rewards: StreakReward[] | undefined) => {
  if (!rewards?.length) {
    return Object.entries(DEFAULT_REWARD_MAP).map(([days, xp]) => ({
      days: Number(days),
      xp,
    }));
  }

  return rewards.map((reward) => ({
    days: reward.threshold,
    xp: DEFAULT_REWARD_MAP[reward.threshold] ?? 0,
  }));
};

const VaultStreak = ({ vaultId, vault, isDetailLoading }: VaultStreakProps) => {
  const { address, isAuthenticated } = useWallet();
  const safeVaultId = vaultId ?? "";

  const {
    record,
    events,
    rewards,
    ensureSnapshotForToday,
  } = useStreak(
    safeVaultId,
    isAuthenticated ? address : undefined
  );

  const lpToken = useGetLpToken(vault?.vault_lp_token ?? "", safeVaultId);

  const hasNDLP = useMemo(
    () => Number(lpToken?.balance ?? 0) > 0,
    [lpToken?.balance]
  );

  useEffect(() => {
    ensureSnapshotForToday(hasNDLP);
  }, [ensureSnapshotForToday, hasNDLP]);

  const milestones = useMemo(
    () => resolveMilestones(rewards),
    [rewards]
  );

  const resetInMs = getMsUntilNextUtcMidnight();

  if (!vaultId) {
    return null;
  }

  const todayKey = utcDayKey(Date.now());
  const todayDone = events.some((event) => event.dayKey === todayKey);

  return (
    <DetailWrapper
      title="Streak Tracker"
      isLoading={isDetailLoading}
      loadingStyle="h-[240px] w-full"
    >
      <StreakTrackerCard
        current={record?.current ?? 0}
        longest={record?.longest ?? 0}
        todayDone={todayDone}
        resetInMs={resetInMs}
        milestones={milestones}
        onDeposit={() =>
          dispatchMissionDepositPrefill(0)
        }
        showTitle={false}
      />
    </DetailWrapper>
  );
};

export default VaultStreak;
