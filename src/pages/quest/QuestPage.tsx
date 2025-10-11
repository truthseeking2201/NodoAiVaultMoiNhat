import { useMemo, useState } from "react";
import QuestSummaryCard from "@/components/quest/cards/QuestSummaryCard";
import { QuestAccordion } from "@/components/quest/QuestAccordion";
import { QuestDepositModal } from "@/components/quest/deposit/QuestDepositModal";
import { useQuestV2 } from "@/hooks/useQuestV2";
import type { Quest } from "@/lib/quest-types";
import { CardHeaderBar } from "@/components/ui/card-header-bar";

const getSuggestedDepositAmount = (quest: Quest) => {
  if (quest.kind !== "deposit_and_hold") {
    return 0;
  }
  const required = quest.runtime?.requiredDepositUsd ?? quest.minDepositUsd;
  const current = quest.runtime?.currentBalanceUsd ?? 0;
  const missing = Math.max(0, required - current);
  return missing > 0 ? missing : required;
};

export default function QuestPage() {
  const { quests, start, claim } = useQuestV2();
  const [modal, setModal] = useState<{
    open: boolean;
    quest?: Quest;
    amountUsd?: number;
  }>(() => ({
    open: false,
  }));

  const activeCount = useMemo(
    () => quests.filter((quest) => quest.state === "active").length,
    [quests]
  );
  const claimableCount = useMemo(
    () => quests.filter((quest) => quest.state === "claimable").length,
    [quests]
  );
  const totalXp = useMemo(
    () =>
      quests
        .filter((quest) => quest.state === "completed")
        .reduce((sum, quest) => sum + quest.rewardXp, 0),
    [quests]
  );

  const questSections = useMemo(() => {
    const claimable = quests.filter((quest) => quest.state === "claimable");
    const active = quests.filter((quest) => quest.state === "active");
    const available = quests.filter((quest) => quest.state === "available");
    const locked = quests.filter((quest) => quest.state === "locked");
    const completed = quests.filter((quest) => quest.state === "completed");
    const failed = quests.filter((quest) => quest.state === "failed");

    return [
      {
        id: "claimable",
        title: "Claim Rewards",
        subtitle: "Collect XP from finished quests.",
        items: claimable,
        emptyCopy: "No claimable quests right now—wrap up a quest to see it here.",
      },
      {
        id: "active",
        title: "In Progress",
        subtitle: "Track quests you’ve already started.",
        items: active,
        emptyCopy: "Activate a quest to follow your progress here.",
      },
      {
        id: "available",
        title: "Available Now",
        subtitle: "New quests to boost your vault XP.",
        items: available,
        emptyCopy: "All quests completed—for now. Check back soon for more.",
      },
      {
        id: "locked",
        title: "Upcoming & Locked",
        subtitle: "Unlock these by meeting the requirements.",
        items: locked,
        emptyCopy: "No locked quests—keep progressing to reveal new tiers.",
        hideWhenEmpty: true,
      },
      {
        id: "completed",
        title: "Completed",
        subtitle: "XP already counted toward your profile.",
        items: completed,
        emptyCopy: "You haven’t completed any quests yet. Keep going!",
        hideWhenEmpty: true,
      },
      {
        id: "failed",
        title: "Needs Another Attempt",
        subtitle: "Restart these quests when you’re ready.",
        items: failed,
        emptyCopy: "No failed quests—nice work staying on track.",
        hideWhenEmpty: true,
      },
    ] as const;
  }, [quests]);

  const openDepositModal = (quest: Quest, amountUsd?: number) => {
    const fallbackAmount =
      quest.kind === "deposit_and_hold" ? getSuggestedDepositAmount(quest) : 0;
    setModal({ open: true, quest, amountUsd: amountUsd ?? fallbackAmount });
  };

  const handleDepositConfirmed = (amountUsd: number) => {
    const quest = modal.quest;
    if (!quest) {
      setModal({ open: false });
      return;
    }
    if (quest.vaultIdRequired) {
      window.dispatchEvent(
        new CustomEvent("deposit:confirmed", {
          detail: {
            vaultId: quest.vaultIdRequired,
            amountUsd,
          },
        })
      );
    }
    setModal({ open: false });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <section className="space-y-3 text-center sm:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
          Quest Hub
        </span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          Level up your vault XP with curated quests
        </h1>
        <p className="text-sm text-white/70 sm:text-base sm:text-white/60">
          Start quests to grow XP shares, unlock streak bonuses, and claim rewards as you progress across the vault lineup.
        </p>
      </section>

      <QuestSummaryCard
        totalXp={totalXp}
        activeCount={activeCount}
        claimableCount={claimableCount}
      />

      <section className="space-y-5">
        {questSections
          .filter((section) => section.items.length || !section.hideWhenEmpty)
          .map((section) => (
            <div
              key={section.id}
              className="glass-card overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <CardHeaderBar title={section.title} subtitle={section.subtitle} />
              {section.items.length ? (
                <div className="p-2">
                  <QuestAccordion
                    items={section.items}
                    onStart={start}
                    onClaim={claim}
                    onGoDeposit={(id, amountUsd) => {
                      const quest = quests.find((item) => item.id === id);
                      if (!quest) return;
                      if (quest.state === "available") {
                        start(id);
                      }
                      openDepositModal(quest, amountUsd);
                    }}
                  />
                </div>
              ) : (
                <div className="px-5 py-6 text-sm text-white/55">
                  {section.emptyCopy}
                </div>
              )}
            </div>
          ))}
      </section>

      {modal.open && modal.quest && modal.quest.kind === "deposit_and_hold" && (
        <QuestDepositModal
          open={modal.open}
          onOpenChange={(open) => setModal((prev) => ({ ...prev, open }))}
          defaultAmountUsd={
            modal.amountUsd ?? getSuggestedDepositAmount(modal.quest)
          }
          onDepositConfirmed={handleDepositConfirmed}
        />
      )}
    </div>
  );
}
