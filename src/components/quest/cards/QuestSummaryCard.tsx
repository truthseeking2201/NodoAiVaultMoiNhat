import { Card } from "@/components/ui/card";
import { CardHeaderBar } from "@/components/ui/card-header-bar";
import { Flame, Trophy } from "lucide-react";

type QuestSummaryCardProps = {
  totalXp: number;
  pendingXp?: number;
  currentStreak: number;
  longestStreak: number;
  nextMilestone?: {
    day: number;
    xp: number;
  };
  onViewStreak?: () => void;
};

const formatNumber = (value: number) =>
  Number.isFinite(value) ? value.toLocaleString("en-US") : "0";

export function QuestSummaryCard({
  totalXp,
  pendingXp,
  currentStreak,
  longestStreak,
  nextMilestone,
  onViewStreak,
}: QuestSummaryCardProps) {
  const metrics = [
    { label: "Total XP Shares", value: totalXp },
    { label: "Pending Rewards", value: pendingXp ?? 0 },
    {
      label: "Current Streak",
      value: currentStreak,
      icon: <Flame size={18} className="text-amber-400" />,
    },
    {
      label: "Longest Streak",
      value: longestStreak,
      icon: <Trophy size={18} className="text-emerald-400" />,
    },
  ];

  return (
    <Card className="glass-card overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur-sm">
      <CardHeaderBar title="Quest Summary" />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className="mb-1 text-xs text-white/60">{metric.label}</div>
              <div className="flex items-center gap-2 text-2xl font-bold tabular-nums tracking-tight">
                {metric.icon}
                {formatNumber(metric.value)}
              </div>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-white/10" />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
          {nextMilestone ? (
            <span>
              Next milestone{" "}
              <span className="text-white/90">
                Day {formatNumber(nextMilestone.day)}
              </span>
              {" → "}
              <span className="text-white/90">
                XP {formatNumber(nextMilestone.xp)}
              </span>
            </span>
          ) : (
            <span>Stay active to unlock your next milestone.</span>
          )}
          {onViewStreak && (
            <button
              type="button"
              onClick={() => onViewStreak?.()}
              className="text-white/80 transition hover:text-white"
              aria-label="View streak tracker"
            >
              View streak
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
