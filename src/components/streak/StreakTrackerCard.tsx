import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Flame,
  Gift,
  Info,
} from "lucide-react";

type Milestone = {
  days: number;
  xp: number;
};

const DEFAULT_MILESTONES: Milestone[] = [
  { days: 1, xp: 100 },
  { days: 3, xp: 300 },
  { days: 7, xp: 1_000 },
  { days: 14, xp: 2_400 },
  { days: 30, xp: 6_000 },
];

type StreakTrackerCardProps = {
  current: number;
  longest: number;
  todayDone: boolean;
  resetInMs: number;
  milestones?: Milestone[];
  onDeposit?: () => void;
  className?: string;
  showTitle?: boolean;
};

const formatTimeLeft = (ms: number) => {
  if (!Number.isFinite(ms) || ms <= 0) return "0h 00m";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

export function StreakTrackerCard({
  current,
  longest,
  todayDone,
  resetInMs,
  milestones = DEFAULT_MILESTONES,
  onDeposit,
  className,
  showTitle = true,
}: StreakTrackerCardProps) {
  const { achieved, nextMilestone, maxDays } = useMemo(() => {
    const maxDays = milestones[milestones.length - 1]?.days ?? 1;
    const achieved = milestones
      .filter((milestone) => current >= milestone.days)
      .map((milestone) => milestone.days);
    const nextMilestone =
      milestones.find((milestone) => current < milestone.days) ??
      milestones[milestones.length - 1];

    return {
      achieved,
      nextMilestone,
      maxDays,
    };
  }, [current, milestones]);

  const progressPercentage = Math.min(
    100,
    (current / Math.max(1, maxDays)) * 100
  );

  const statusChip = (
    <div
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] uppercase tracking-wide shadow-[0_0_20px_rgba(0,0,0,0.1)]",
        todayDone
          ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-200"
          : "border-white/12 bg-white/6 text-white/70"
      )}
      aria-live="polite"
    >
      {todayDone ? "Today completed" : `Resets in ${formatTimeLeft(resetInMs)}`}
    </div>
  );

  return (
    <Card
      className={cn(
        "glass-card rounded-xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_2px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm",
        className
      )}
      aria-labelledby={showTitle ? "streak-tracker-heading" : undefined}
      aria-label={!showTitle ? "Streak tracker" : undefined}
    >
      {showTitle ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p
              id="streak-tracker-heading"
              className="text-base font-bold text-white md:text-lg"
            >
              Streak Tracker
            </p>
            <Info className="h-4 w-4 text-white/50" aria-hidden="true" />
          </div>
          {statusChip}
        </div>
      ) : (
        <div className="mb-3 flex justify-end">{statusChip}</div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/7 p-2">
            <Flame className="h-4 w-4 text-amber-400" aria-hidden="true" />
          </div>
          <div className="text-xs uppercase tracking-wide text-white/60">
            Current Streak
          </div>
        </div>
        <div className="text-3xl font-bold tabular-nums tracking-tight md:text-4xl">
          {current}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <span>Milestones &amp; Rewards</span>
        <span className="flex items-center gap-1">
          <span className="text-white/60">Longest</span>
          <span className="rounded-full border border-white/12 bg-white/6 px-2 py-1 text-white/75 tabular-nums">
            {longest}
          </span>
        </span>
      </div>

      <TooltipProvider delayDuration={100}>
        <div className="relative mb-4">
          <div className="h-2 w-full rounded-full border border-white/10 bg-white/9" />
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-emerald-400/70 to-emerald-400"
            style={{ width: `${progressPercentage}%` }}
          />
          {milestones.map((milestone) => {
            const left = `${(milestone.days / maxDays) * 100}%`;
            const isAchieved = achieved.includes(milestone.days);
            const isNext = milestone.days === nextMilestone.days && !isAchieved;

            return (
              <Tooltip key={milestone.days}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "absolute -top-1.5 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border text-white transition",
                      isAchieved
                        ? "border-emerald-300/30 bg-emerald-400 text-white shadow"
                        : "border-white/20 bg-white/10 text-white/80",
                      isNext && "!border-amber-400/40 bg-amber-400/20 backdrop-blur"
                    )}
                    style={{ left }}
                    aria-label={`Day ${milestone.days} milestone`}
                  >
                    {isAchieved ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Gift className="h-3 w-3" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="border-white/10 bg-[#13141A] text-white">
                  <p className="text-xs">
                    <span className="font-semibold">
                      Day {milestone.days}
                    </span>
                    <br />
                    Reward: XP{" "}
                    {milestone.xp.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 text-[13px] no-scrollbar">
        {milestones.map((milestone) => {
          const isAchieved = achieved.includes(milestone.days);
          const isNext = milestone.days === nextMilestone.days && !isAchieved;
          return (
            <div
              key={milestone.days}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1",
                isAchieved
                  ? "border-white/12 bg-white/6 text-white/70"
                  : "border-white/15 bg-white/9 text-white/85",
                isNext && "ring-2 ring-amber-400/30"
              )}
              aria-live={isNext ? "polite" : "off"}
            >
              <span className="tabular-nums">Day {milestone.days}</span>
              <span className="text-white/60">•</span>
              <span className="tabular-nums">
                XP{" "}
                {milestone.xp.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </span>
              {isAchieved && (
                <Check className="h-3 w-3 text-emerald-300" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-white/65">
        <span>
          Next:{" "}
          <span className="text-white/85">
            Day {nextMilestone.days} → XP{" "}
            {nextMilestone.xp.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </span>
        </span>
        <button
          type="button"
          onClick={onDeposit}
          className="inline-flex items-center gap-1 text-sm text-white/80 transition hover:text-white"
        >
          Deposit to keep streak
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </Card>
  );
}
