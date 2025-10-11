import { useMemo, useState } from "react";
import QuestSummaryCard from "@/components/quest/cards/QuestSummaryCard";
import { QuestAccordion } from "@/components/quest/QuestAccordion";
import { QuestDepositModal } from "@/components/quest/deposit/QuestDepositModal";
import { useQuestV2 } from "@/hooks/useQuestV2";
import type { Quest } from "@/lib/quest-types";

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

  const openDepositModal = (quest: Quest, amountUsd: number) => {
    setModal({ open: true, quest, amountUsd });
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
      <QuestSummaryCard
        totalXp={totalXp}
        activeCount={activeCount}
        claimableCount={claimableCount}
      />

      <div className="glass-card rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="h-12 flex items-center px-5 bg-white/8 border-b border-white/10 text-[15px] font-medium text-white/90">
          Quests
        </div>
        <div className="p-2">
          <QuestAccordion
            items={quests}
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
      </div>

      {modal.open && modal.quest && modal.quest.kind === "deposit_and_hold" && (
        <QuestDepositModal
          open={modal.open}
          onOpenChange={(open) => setModal((prev) => ({ ...prev, open }))}
          defaultAmountUsd={
            modal.amountUsd ??
            modal.quest.runtime?.requiredDepositUsd ??
              modal.quest.minDepositUsd
          }
          onDepositConfirmed={handleDepositConfirmed}
        />
      )}
    </div>
  );
}
