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

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-[12px] border border-[#2A2A2A] bg-white/10 px-3 py-3 md:px-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <LabelWithTooltip
          hasIcon={false}
          label="Streak"
          tooltipContent="Maintained by holding NDLP across midnight UTC or making one deposit per day."
          labelClassName="text-white/80 text-xs font-sans underline underline-offset-4 decoration-dotted decoration-gray-600"
        />
        <div
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px]",
            coveredToday
              ? "border-white/20 text-white/80"
              : "border-green-increase/30 bg-green-increase text-slate-950"
          )}
        >
          {coveredToday ? "You're covered today" : "Keep streak • Deposit"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-[72px] w-[72px]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="rgba(255,255,255,0.12)"
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
              <Skeleton className="h-4 w-12" />
            ) : (
              <div className="text-center">
                <div className="font-mono text-sm text-white">
                  {current} day{s(current)}
                </div>
                <div className="mt-0.5 text-[10px] text-white/60">
                  to {nextTarget}-day
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div className="text-sm text-white/70">Current streak</div>
              <div className="font-mono text-xl text-white">
                {current} day{s(current)}
              </div>
              <div className="text-[12px] text-white/60">
                {Math.max(0, nextTarget - current)} day{s(
                  Math.max(0, nextTarget - current)
                )} to {nextTarget}-day milestone
              </div>
            </>
          )}
        </div>

        <div className="shrink-0 text-right">
          {loading ? (
            <Skeleton className="ml-auto h-4 w-12" />
          ) : (
            <>
              <div className="text-[11px] text-white/60">Longest</div>
              <div className="font-mono text-sm text-white">{longest}d</div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[12px] md:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, index) => (
            <div
              key={`s-${index}`}
              className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-2"
            >
              <Skeleton className="mb-1 h-3 w-20" />
              <Skeleton className="h-3 w-14" />
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

      <div>
        <div className="h-[2px] w-full rounded bg-white/10" />
        <div className="mt-2 flex justify-between">
          {milestonePips.map((pip) => (
            <div key={pip.milestone} className="flex flex-col items-center">
              <div
                className={cn(
                  "h-3.5 w-3.5 rounded-full",
                  pip.state === "reached"
                    ? "bg-green-increase"
                    : pip.state === "next"
                    ? "bg-white/80 ring-2 ring-green-increase/40"
                    : "bg-white/20"
                )}
              />
              <div className="mt-1 text-[10px] text-white/70">
                {pip.milestone}d
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const StatChip = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-2">
    <div className="text-[10px] text-white/60">{label}</div>
    <div className="font-mono text-[12px] text-white tabular-nums truncate">
      {value}
    </div>
  </div>
);
