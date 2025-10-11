import { useMemo, useState } from "react";
import QuestSummaryCard from "@/components/quest/cards/QuestSummaryCard";
import { QuestAccordion } from "@/components/quest/QuestAccordion";
import { QuestDepositModal } from "@/components/quest/deposit/QuestDepositModal";
import { useQuest } from "@/hooks/useQuest";
import type { Quest } from "@/lib/quest-types";

const STATE_ORDER: Record<Quest["state"], number> = {
  claimable: 0,
  active: 1,
  available: 2,
  locked: 3,
  completed: 4,
  failed: 5,
};

export default function QuestPage() {
  const { list, start, claim, markDepositConfirmed } = useQuest();
  const [depositModal, setDepositModal] = useState<{
    open: boolean;
    quest?: Quest;
    amountUsd?: number;
  }>({ open: false });

  const sortedQuests = useMemo(() => {
    return [...list].sort((a, b) => {
      const byState = STATE_ORDER[a.state] - STATE_ORDER[b.state];
      if (byState !== 0) {
        return byState;
      }
      return a.rewardXp - b.rewardXp;
    });
  }, [list]);

  const totalXp = useMemo(
    () =>
      list
        .filter((quest) => quest.state === "completed")
        .reduce((sum, quest) => sum + quest.rewardXp, 0),
    [list]
  );
  const activeCount = useMemo(
    () => list.filter((quest) => quest.state === "active").length,
    [list]
  );
  const claimableCount = useMemo(
    () => list.filter((quest) => quest.state === "claimable").length,
    [list]
  );

  const openDepositModal = (quest: Quest, amountUsd: number) => {
    setDepositModal({ open: true, quest, amountUsd });
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
            items={sortedQuests}
            onStart={start}
            onClaim={claim}
            onGoDeposit={(id, amount) => {
              const selected = list.find((quest) => quest.id === id);
              if (!selected) {
                return;
              }
              if (selected.state === "available") {
                start(selected.id);
              }
              openDepositModal(selected, amount);
            }}
          />
        </div>
      </div>

      <QuestDepositModal
        open={depositModal.open}
        onOpenChange={(open) => setDepositModal((prev) => ({ ...prev, open }))}
        defaultAmountUsd={depositModal.amountUsd ?? 5}
        onDepositConfirmed={(amountUsd) => {
          setDepositModal({ open: false });
          markDepositConfirmed(amountUsd);
        }}
      />
    </div>
  );
}
