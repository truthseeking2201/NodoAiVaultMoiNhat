import { useEffect, useMemo } from "react";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useStreak } from "../hooks/use-streak";
import { utcDayKey } from "../logic";
import { formatNumber } from "@/lib/number";

const MILESTONES = [3, 7, 14, 30];

type Props = {
  vaultId: string;
  wallet?: string;
  hasNDLP: boolean;
  className?: string;
  variant?: "standalone" | "embedded";
};

const s = (value: number) => (value === 1 ? "" : "s");

const formatLocalTime = (timestamp?: number) => {
  if (!timestamp) return "--";
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    return "--";
  }
};

const prettyAmount = (amount?: number) => {
  if (!amount) return "--";
  if (amount >= 1000) return `$${formatNumber(amount, 0, 0)}`;
  return `$${formatNumber(amount, 0, 2)}`;
};

export default function StreakCard({
  vaultId,
  wallet,
  hasNDLP,
  className,
  variant = "standalone",
}: Props) {
  const {
    record,
    rewards,
    stats,
    events,
    ensureSnapshotForToday,
  } = useStreak(vaultId, wallet);

  useEffect(() => {
    ensureSnapshotForToday(hasNDLP);
  }, [hasNDLP, ensureSnapshotForToday]);

  const loading = !wallet || !record;
  const current = record?.current ?? 0;
  const longest = record?.longest ?? 0;

  const nextTarget = useMemo(
    () => MILESTONES.find((milestone) => current < milestone) ?? MILESTONES[MILESTONES.length - 1],
    [current]
  );

  const coveredToday = useMemo(() => {
    if (!wallet) return false;
    const today = utcDayKey(Date.now());
    return events.some((event) => event.dayKey === today);
  }, [wallet, events]);

  const progress = Math.min(current / nextTarget, 1);

  const activeRatio = `${stats.activeDays7}/${stats.activeDays30}`;
  const consistency = `${Math.round(stats.consistency7 * 100)}%`;
  const depositsSummary = `${stats.deposits7} · ${prettyAmount(stats.depositSum7)}`;
  const lastEvent = formatLocalTime(stats.lastEventAt);

  const milestonePips = useMemo(() => {
    return MILESTONES.map((milestone) => {
      const state =
        current >= milestone
          ? "reached"
          : stats.nextMilestone === milestone
          ? "next"
          : "locked";
      return {
        milestone,
        state,
      };
    });
  }, [current, stats.nextMilestone]);

  const milestoneProgress = useMemo(() => {
    const maxMilestone = MILESTONES[MILESTONES.length - 1] || 1;
    return Math.min(current / maxMilestone, 1) * 100;
  }, [current]);

  const baseContainer =
    "relative isolate flex w-full flex-col gap-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1b2d] via-[#0f111c] to-[#06070d] px-5 py-5 md:px-6 md:py-6 shadow-[0_24px_60px_rgba(6,8,15,0.45)]";

  const containerClass = cn(
    baseContainer,
    variant === "embedded" && "border-white/5 shadow-[0_18px_45px_rgba(4,6,12,0.35)]",
    className
  );

  return (
    <div className={containerClass}>
      <span className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(113,76,255,0.45)_0%,rgba(113,76,255,0)_70%)]" />
      <span className="pointer-events-none absolute -bottom-32 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(63,230,176,0.35)_0%,rgba(63,230,176,0)_75%)]" />

      <div className="relative z-[1] flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <LabelWithTooltip
            hasIcon={false}
            label="Streak"
            tooltipContent="Maintained by holding NDLP across midnight UTC or making one deposit per day."
            labelClassName="text-xs uppercase tracking-[0.28em] text-white/60"
          />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] transition",
                coveredToday
                  ? "border-[rgba(63,230,176,0.25)] bg-[rgba(63,230,176,0.12)] text-[#3FE6B0]"
                  : "border-white/25 bg-white/10 text-white/80"
              )}
            >
              {coveredToday ? "Covered today" : "Keep streak"}
            </div>
            {loading ? (
              <Skeleton className="h-6 w-20 rounded-full" />
            ) : (
              <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                <span className="uppercase tracking-[0.16em] text-white/40">Longest</span>
                <span className="ml-2 font-mono text-sm text-white">{longest}d</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="relative flex items-center gap-4 md:min-w-[220px]">
            <div className="absolute inset-0 -translate-x-1/6 blur-[40px]" />
            <div className="relative h-[86px] w-[86px]">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(63,230,176,0.25)_0%,rgba(63,230,176,0)_80%)]" />
              <svg viewBox="0 0 100 100" className="relative h-full w-full">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#3FE6B0"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42 * progress} ${
                    2 * Math.PI * 42 * (1 - progress)
                  }`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                {loading ? (
                  <Skeleton className="h-5 w-14" />
                ) : (
                  <div className="text-center">
                    <div className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">
                      {current} day{s(current)}
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/60">
                      to {nextTarget}-day
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {loading ? (
              <>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-40" />
              </>
            ) : (
              <>
                <div className="text-sm uppercase tracking-[0.24em] text-white/50">
                  Current streak
                </div>
                <div className="font-mono text-3xl text-white">
                  {current} day{s(current)}
                </div>
                <div className="text-[13px] text-white/70">
                  {Math.max(0, nextTarget - current)} day{s(
                    Math.max(0, nextTarget - current)
                  )} until the {nextTarget}-day milestone
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[12px] md:grid-cols-4">
          {loading ? (
            [...Array(4)].map((_, index) => (
              <div
                key={`s-${index}`}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3"
              >
                <Skeleton className="mb-2 h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))
          ) : (
            <>
              <StatChip label="Active (7d/30d)" value={activeRatio} />
              <StatChip label="Consistency (7d)" value={consistency} />
              <StatChip label="Deposits (7d)" value={depositsSummary} />
              <StatChip label="Last event" value={lastEvent} />
            </>
          )}
        </div>

        <div className="relative mt-2">
          <div className="h-[3px] w-full rounded-full bg-white/10" />
          <div
            className="absolute left-0 top-0 h-[3px] rounded-full bg-gradient-to-r from-[#3FE6B0] via-[#57CFFF] to-white/90"
            style={{ width: `${milestoneProgress}%` }}
          />
          <div className="relative mt-4 flex justify-between">
            {milestonePips.map((pip) => (
              <div key={pip.milestone} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border border-white/15 bg-white/5 transition",
                    pip.state === "reached" &&
                      "border-[rgba(63,230,176,0.6)] bg-[rgba(63,230,176,0.15)] shadow-[0_0_14px_rgba(63,230,176,0.35)]",
                    pip.state === "next" &&
                      "border-white/40 bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  )}
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full bg-white/30",
                      pip.state === "reached" && "bg-[#3FE6B0]",
                      pip.state === "next" && "bg-white"
                    )}
                  />
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                  {pip.milestone}d
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatChip = ({ label, value }: { label: string; value: string }) => (
  <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:border-white/25 hover:bg-white/[0.08]">
    <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 transition group-hover:text-white/70">
      {label}
    </div>
    <div className="mt-1 font-mono text-sm text-white/90 tabular-nums transition group-hover:text-white">
      {value}
    </div>
  </div>
);
