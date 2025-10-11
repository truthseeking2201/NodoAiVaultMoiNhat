import { Card } from "@/components/ui/card";
import { CardHeaderBar } from "@/components/ui/card-header-bar";

export default function QuestSummaryCard({
  totalXp = 0,
  activeCount = 0,
  claimableCount = 0,
}: {
  totalXp?: number;
  activeCount?: number;
  claimableCount?: number;
}) {
  return (
    <Card className="glass-card overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white">
      <CardHeaderBar title="Quest Summary" />
      <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-white/60 mb-1">Total XP Shares</div>
          <div className="text-3xl font-bold tabular-nums">
            {totalXp.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Active Quests</div>
          <div className="text-3xl font-bold tabular-nums">{activeCount}</div>
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Claimable Now</div>
          <div className="text-3xl font-bold tabular-nums">
            {claimableCount}
          </div>
        </div>
      </div>
    </Card>
  );
}
