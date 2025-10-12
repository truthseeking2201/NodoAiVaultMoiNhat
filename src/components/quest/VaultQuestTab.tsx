import { useMemo } from "react";
import { QuestRow } from "@/components/quest/QuestRow";
import { useQuestV2 } from "@/hooks/useQuestV2";
import { openDepositModal } from "@/lib/deposit-portal";

type VaultQuestTabProps = {
  vaultId?: string | null;
};

export function VaultQuestTab({ vaultId }: VaultQuestTabProps) {
  const { quests, start, claim } = useQuestV2();

  const items = useMemo(() => {
    if (!vaultId) {
      return quests.filter((quest) => quest.vaultIdRequired === "any");
    }
    return quests.filter(
      (quest) =>
        quest.vaultIdRequired === "any" || quest.vaultIdRequired === vaultId
    );
  }, [quests, vaultId]);

  const handleDeposit = (id: string, amountUsd: number) => {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return;
    }
    const quest = quests.find((item) => item.id === id);
    if (!quest || quest.kind !== "deposit_and_hold") {
      return;
    }
    openDepositModal({
      vaultId: quest.vaultIdRequired ?? vaultId ?? undefined,
      amountUsd,
      source: "quest",
      questId: quest.id,
    });
  };

  if (!items.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        No quests for this vault right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((quest) => (
        <QuestRow
          key={quest.id}
          q={quest}
          onStart={start}
          onClaim={claim}
          onDeposit={handleDeposit}
        />
      ))}
    </div>
  );
}
