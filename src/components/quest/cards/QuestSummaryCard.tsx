import { Card } from "@/components/ui/card";
import { CardHeaderBar } from "@/components/ui/card-header-bar";

type QuestSummaryCardProps = {
  totalXp?: number;
};

export default function QuestSummaryCard({
  totalXp = 0,
}: QuestSummaryCardProps) {
  return (
    <Card className="glass-card overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white">
      <CardHeaderBar title="Quest Summary" />
      <div className="p-6">
        <div className="text-xs text-white/60 mb-1">Total XP Shares</div>
        <div className="text-3xl font-bold tabular-nums">
          {totalXp.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}
