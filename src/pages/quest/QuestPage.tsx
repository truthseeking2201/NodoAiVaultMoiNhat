import { useMemo } from "react";
import QuestSummaryCard from "@/components/quest/cards/QuestSummaryCard";
import { QuestTabs } from "@/components/quest/QuestTabs";
import { useQuestV2 } from "@/hooks/useQuestV2";
import type { Quest } from "@/lib/quest-types";
import { openDepositModal } from "@/lib/deposit-portal";
import { useNavigate } from "react-router-dom";
import { getPathVaultDetail } from "@/config/router";

export default function QuestPage() {
  const { quests, start, claim } = useQuestV2();
  const navigate = useNavigate();

  const totals = useMemo(
    () => ({
      totalXp: quests
        .filter((quest) => quest.state === "completed")
        .reduce((sum, quest) => sum + quest.rewardXp, 0),
      activeCount: quests.filter((quest) => quest.state === "active").length,
      claimableCount: quests.filter((quest) => quest.state === "claimable").length,
    }),
    [quests]
  );

  const resolveDepositAmount = (quest: Quest, amountUsd?: number) => {
    if (quest.kind !== "deposit_and_hold") {
      return undefined;
    }
    if (amountUsd && amountUsd > 0) {
      return amountUsd;
    }
    const required = quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd;
    const current = quest.runtime?.currentBalanceUsd ?? 0;
    const missing = Math.max(0, required - current);
    return missing > 0 ? missing : required;
  };

  const handleDeposit = (id: string, amountUsd: number) => {
    const quest = quests.find((item) => item.id === id);
    if (!quest || quest.kind !== "deposit_and_hold") {
      return;
    }
    const resolvedAmount = resolveDepositAmount(quest, amountUsd);
    if (!resolvedAmount || resolvedAmount <= 0) {
      return;
    }
    const targetVaultId =
      quest.vaultIdRequired && quest.vaultIdRequired !== "any"
        ? quest.vaultIdRequired
        : undefined;

    if (targetVaultId) {
      navigate(getPathVaultDetail(targetVaultId));
    }

    window.setTimeout(() => {
      openDepositModal({
        vaultId: targetVaultId,
        amountUsd: resolvedAmount,
        source: "quest",
        questId: quest.id,
      });
    }, 0);
  };

  const handleStart = (id: string) => {
    start(id);
  };

  const handleClaim = (id: string) => {
    claim(id);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-8 shadow-[0_30px_80px_rgba(6,20,45,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(80,227,194,0.18),transparent)] opacity-90" />
        <div className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full border border-white/10 opacity-40" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-44 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative space-y-3">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Level up your vault XP with curated quests
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Start quests to earn XP Shares, unlock bonuses, and keep your vault strategy laser-focused.
          </p>
        </div>
      </section>

      <QuestSummaryCard
        totalXp={totals.totalXp}
        activeCount={totals.activeCount}
        claimableCount={totals.claimableCount}
      />

      <QuestTabs
        quests={quests}
        onStart={handleStart}
        onClaim={handleClaim}
        onDeposit={handleDeposit}
      />
    </div>
  );
}
