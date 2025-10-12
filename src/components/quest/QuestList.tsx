import type { Quest } from "@/lib/quest-types";
import { QuestRow } from "@/components/quest/QuestRow";

type QuestListProps = {
  items: Quest[];
  emptyText: string;
  onStart: (id: string) => void;
  onClaim: (id: string) => void;
  onDeposit: (id: string, amountUsd?: number) => void;
};

export function QuestList({
  items,
  emptyText,
  onStart,
  onClaim,
  onDeposit,
}: QuestListProps) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((quest) => (
        <QuestRow
          key={quest.id}
          quest={quest}
          onStart={onStart}
          onClaim={onClaim}
          onDeposit={onDeposit}
        />
      ))}
    </div>
  );
}
