import { Card } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";

type QuestSummaryCardProps = {
  totalXp: number;
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
  currentStreak,
  longestStreak,
  nextMilestone,
  onViewStreak,
}: QuestSummaryCardProps) {
  return (
    <Card className="glass-card rounded-xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-sm">
      <div className="mb-4 text-xs uppercase tracking-wide text-white/60">
        Quest Summary
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <div className="mb-1 text-xs text-white/60">Total XP Shares</div>
          <div className="text-3xl font-bold tabular-nums tracking-tight">
            {formatNumber(totalXp)}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-white/60">Current Streak</div>
          <div className="flex items-center gap-2 text-2xl font-bold tabular-nums">
            <Flame size={18} className="text-amber-400" />
            {formatNumber(currentStreak)}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-white/60">Longest Streak</div>
          <div className="flex items-center gap-2 text-2xl font-bold tabular-nums">
            <Trophy size={18} className="text-emerald-400" />
            {formatNumber(longestStreak)}
          </div>
        </div>
      </div>

      <div className="my-4 border-t border-white/10" />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
        {nextMilestone ? (
          <span>
            Next milestone{" "}
            <span className="text-white/90">Day {formatNumber(nextMilestone.day)}</span>
            {" → "}
            <span className="text-white/90">
              XP {formatNumber(nextMilestone.xp)}
            </span>
          </span>
        ) : (
          <span>Stay active to unlock your next milestone.</span>
        )}
        <button
          type="button"
          onClick={() => onViewStreak?.()}
          className="text-white/80 transition hover:text-white"
          aria-label="View streak tracker"
        >
          View streak
        </button>
      </div>
    </Card>
  );
}
