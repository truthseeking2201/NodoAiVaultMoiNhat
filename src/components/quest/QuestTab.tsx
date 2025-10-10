import { useCallback, useEffect, useMemo } from "react";

import { QuestSummaryCard } from "@/components/quest/cards/QuestSummaryCard";
import {
  DEFAULT_MISSIONS,
  Mission,
  MissionsXPCard,
} from "@/components/rewards/MissionsXPCard";
import { StreakTrackerCard } from "@/components/streak/StreakTrackerCard";
import { useGetLpToken } from "@/hooks";
import { useWallet } from "@/hooks/use-wallet";
import { useStreak } from "@/features/streak-vault/hooks/use-streak";
import { utcDayKey } from "@/features/streak-vault/logic";
import { BasicVaultDetailsType } from "@/types/vault-config.types";

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

const resolveMilestones = (rewards: { threshold: number }[] | undefined) => {
  if (!rewards?.length) {
    return Object.entries(DEFAULT_REWARD_MAP).map(([day, xp]) => ({
      days: Number(day),
      xp,
    }));
  }

  return rewards.map((reward) => ({
    days: reward.threshold,
    xp: DEFAULT_REWARD_MAP[reward.threshold] ?? 0,
  }));
};

type QuestTabProps = {
  vaultId?: string;
  vault?: BasicVaultDetailsType;
  missions?: Mission[];
  onDepositPrefill: (amountUsd: number) => void;
  isDepositDisabled?: boolean;
  disabledReason?: string;
};

export function QuestTab({
  vaultId,
  vault,
  missions,
  onDepositPrefill,
  isDepositDisabled,
  disabledReason,
}: QuestTabProps) {
  const safeVaultId = vaultId ?? "";
  const { address, isAuthenticated } = useWallet();
  const {
    record,
    events,
    rewards,
    ensureSnapshotForToday,
  } = useStreak(safeVaultId, isAuthenticated ? address : undefined);

  const lpToken = useGetLpToken(vault?.vault_lp_token ?? "", safeVaultId);
  const hasNdlp = useMemo(
    () => Number(lpToken?.balance ?? 0) > 0,
    [lpToken?.balance]
  );

  useEffect(() => {
    if (safeVaultId) {
      ensureSnapshotForToday(hasNdlp);
    }
  }, [ensureSnapshotForToday, hasNdlp, safeVaultId]);

  const questMissions = useMemo<Mission[]>(
    () => missions ?? DEFAULT_MISSIONS,
    [missions]
  );

  const totalXp = useMemo(
    () => questMissions.reduce((sum, mission) => sum + mission.xpShares, 0),
    [questMissions]
  );

  const milestones = useMemo(
    () => resolveMilestones(rewards),
    [rewards]
  );

  const currentStreak = record?.current ?? 0;
  const longestStreak = record?.longest ?? 0;

  const nextMilestone = useMemo(() => {
    if (!milestones.length) return undefined;
    return (
      milestones.find((milestone) => currentStreak < milestone.days) ??
      milestones[milestones.length - 1]
    );
  }, [milestones, currentStreak]);

  const todayKey = useMemo(() => utcDayKey(Date.now()), []);
  const todayDone = useMemo(
    () => events.some((event) => event.dayKey === todayKey),
    [events, todayKey]
  );

  const resetInMs = getMsUntilNextUtcMidnight();

  const handleViewStreak = useCallback(() => {
    const element = document.getElementById("quest-streak");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const defaultDepositAmount =
    questMissions.find((mission) => mission.thresholdUsd > 0)?.thresholdUsd ??
    0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <QuestSummaryCard
          totalXp={totalXp}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          nextMilestone={
            nextMilestone
              ? {
                  day: nextMilestone.days,
                  xp: nextMilestone.xp,
                }
              : undefined
          }
          onViewStreak={handleViewStreak}
        />
        <MissionsXPCard
          missions={questMissions}
          onDepositPrefill={onDepositPrefill}
          isDepositDisabled={isDepositDisabled}
          disabledReason={disabledReason}
        />
      </div>
      <div className="space-y-6" id="quest-streak">
        <StreakTrackerCard
          current={currentStreak}
          longest={longestStreak}
          todayDone={todayDone}
          resetInMs={resetInMs}
          milestones={milestones}
          onDeposit={() => onDepositPrefill(defaultDepositAmount)}
        />
      </div>
    </div>
  );
}
