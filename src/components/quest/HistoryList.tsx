import { Card } from "@/components/ui/card";
import { CardHeaderBar } from "@/components/ui/card-header-bar";
import { QuestRuntime } from "@/lib/quest-state";

type HistoryListProps = {
  items: QuestRuntime[];
};

export function HistoryList({ items }: HistoryListProps) {
  return (
    <Card className="glass-card overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur-sm">
      <CardHeaderBar title="History" />
      <div className="p-6 space-y-3">
        {items.length === 0 && (
          <div className="text-sm text-white/60">
            No completed quests yet.
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex flex-col">
              <span className="text-white/80">{item.title}</span>
              <span className="text-xs text-white/50">
                {item.rewardXp.toLocaleString()} XP Shares
              </span>
            </div>
            <span className="text-xs text-white/55">
              {item.completedAt
                ? new Date(item.completedAt).toLocaleDateString()
                : item.failedAt
                  ? `Failed ${new Date(item.failedAt).toLocaleDateString()}`
                  : "—"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
