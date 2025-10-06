import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConditionRenderer from "@/components/shared/condition-renderer";
import useBreakpoint from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  StreakEvent,
  StreakRecord,
  StreakReward,
  StreakStats,
} from "../types";
import { formatNumber } from "@/lib/number";
import { utcDayKey } from "../logic";

const DAY_MS = 86_400_000;

type StreakModalProps = {
  record: StreakRecord | null;
  events: StreakEvent[];
  rewards: StreakReward[];
  stats: StreakStats;
  vaultId: string;
  wallet?: string;
  onSeedDemo?: () => void;
  onPrimaryAction?: () => void;
  coveredToday: boolean;
};

const s = (value: number) => (value === 1 ? "" : "s");

const usePrevious = <T,>(value: T) => {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const formatLocalTime = (timestamp?: number, fallback = "--") => {
  if (!timestamp) return fallback;
  try {
    return format(new Date(timestamp), "MMM d, yyyy · HH:mm");
  } catch (error) {
    return fallback;
  }
};

const prettyAmount = (amount?: number) => {
  if (!amount || amount <= 0) return null;
  if (amount >= 1000) return `$${formatNumber(amount, 0, 0)}`;
  return `$${formatNumber(amount, 0, 2)}`;
};

type MilestonePip = {
  threshold: number;
  state: "reached" | "next" | "locked";
  reward?: StreakReward;
};

const StreakRing = ({
  days,
  target,
  celebrate,
}: {
  days: number;
  target: number;
  celebrate: boolean;
}) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const [displayDays, setDisplayDays] = useState(days);
  const prevDays = usePrevious(days) ?? days;

  useEffect(() => {
    const start = performance.now();
    const from = prevDays;
    const diff = days - prevDays;
    if (diff === 0) {
      setDisplayDays(days);
      return;
    }

    let frame: number;
    const duration = 480;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplayDays(from + diff * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [days, prevDays]);

  const safeTarget = Math.max(target, 1);
  const normalized = Math.min(displayDays / safeTarget, 1);
  const dash = circumference * normalized;

  return (
    <div className="relative h-[116px] w-[116px]">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#3FE6B0"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform="rotate(-90 60 60)"
          className="transition-[stroke-dasharray] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-mono text-2xl leading-none text-white">
            {Math.round(displayDays)}
          </div>
          <div className="text-xs text-white/60">day{s(Math.round(displayDays))}</div>
        </div>
      </div>
      {celebrate && <ConfettiBurst />}
    </div>
  );
};

const ConfettiBurst = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[...Array(6)].map((_, index) => (
      <span
        key={index}
        className="absolute block h-2 w-2 rounded-full bg-white/80 animate-ping"
        style={{
          left: `${15 + index * 14}%`,
          top: `${20 + (index % 3) * 25}%`,
          animationDelay: `${index * 60}ms`,
        }}
      />
    ))}
  </div>
);

const StreakHero = ({
  stats,
  coveredToday,
  onPrimaryAction,
}: {
  stats: StreakStats;
  coveredToday: boolean;
  onPrimaryAction?: () => void;
}) => {
  const nextTarget = Math.max(stats.nextMilestone, stats.current || 1);
  const daysToNext = Math.max(0, stats.daysToNext);
  const etaLabel = daysToNext > 0 ? format(new Date(stats.etaNextDate), "MMM d") : "—";
  const prevDays = usePrevious(stats.current) ?? stats.current;
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (stats.current > (prevDays ?? 0)) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 650);
      return () => clearTimeout(timer);
    }
  }, [stats.current, prevDays]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center">
      <StreakRing days={stats.current} target={nextTarget} celebrate={celebrate} />
      <div className="flex-1 space-y-1">
        <div className="text-sm text-white/60">Current streak</div>
        <div className="text-3xl font-mono text-white">
          {stats.current} day{s(stats.current)}
        </div>
        <div className="text-sm text-white/60">
          {daysToNext > 0
            ? `${daysToNext} day${s(daysToNext)} to ${nextTarget}-day milestone · ETA ${etaLabel}`
            : "Highest milestone reached"}
        </div>
      </div>
      <div className="md:pl-4">
        <button
          type="button"
          onClick={coveredToday ? undefined : onPrimaryAction}
          disabled={coveredToday}
          className={cn(
            "h-10 rounded-lg border px-4 text-sm font-medium transition",
            coveredToday
              ? "cursor-default border-white/15 text-white/70"
              : "border-green-increase/40 bg-green-increase text-slate-950 hover:brightness-95"
          )}
        >
          {coveredToday ? "You're covered today" : "Keep streak • Deposit"}
        </button>
        {!coveredToday && (
          <div className="mt-1 text-[11px] text-white/45">
            Makes a mock deposit (no real transaction)
          </div>
        )}
      </div>
    </div>
  );
};

const MilestoneRail = ({ pips }: { pips: MilestonePip[] }) => {
  if (!pips.length) return null;
  const maxThreshold = pips[pips.length - 1]?.threshold ?? 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/45">
        Milestones
      </div>
      <div className="relative mt-3 h-[2px] w-full rounded-full bg-white/10" />
      <div className="relative mt-0 flex justify-between">
        {pips.map((pip) => {
          const position = Math.min(1, pip.threshold / maxThreshold) * 100;
          return (
            <div
              key={pip.threshold}
              className="group relative flex w-20 -translate-x-1/2 flex-col items-center"
              style={{ left: `${position}%` }}
            >
              <div
                className={cn(
                  "mt-1 h-3.5 w-3.5 rounded-full transition",
                  pip.state === "reached" && "bg-green-increase",
                  pip.state === "next" && "bg-white/80 ring-2 ring-green-increase/50",
                  pip.state === "locked" && "bg-white/20"
                )}
              />
              <div className="mt-2 text-[11px] font-mono text-white/70">
                {pip.threshold}d
              </div>
              {pip.reward && (
                <div className="pointer-events-none absolute top-[140%] w-40 scale-95 rounded-lg border border-white/10 bg-black/80 p-3 opacity-0 backdrop-blur-sm transition group-hover:scale-100 group-hover:opacity-100">
                  <div className="font-mono text-sm text-white">
                    {pip.reward.threshold}-day · {pip.reward.label}
                  </div>
                  {pip.reward.description && (
                    <div className="mt-1 text-[11px] text-white/55">
                      {pip.reward.description}
                    </div>
                  )}
                  <div
                    className={cn(
                      "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px]",
                      pip.reward.claimed
                        ? "border-green-increase/40 text-green-increase"
                        : pip.state === "next"
                        ? "border-white/30 text-white"
                        : "border-white/15 text-white/50"
                    )}
                  >
                    {pip.reward.claimed ? "Claimed" : pip.state === "next" ? "Next up" : "Locked"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RewardsList = ({ rewards }: { rewards: StreakReward[] }) => {
  if (!rewards.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/45">
        Rewards overview
      </div>
      <div className="mt-3 space-y-2">
        {rewards.map((reward) => (
          <div
            key={reward.threshold}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3"
          >
            <div>
              <div className="font-mono text-sm text-white">
                {reward.threshold}-day · {reward.label}
              </div>
              {reward.description && (
                <div className="text-[11px] text-white/55">{reward.description}</div>
              )}
            </div>
            <Badge
              variant={reward.claimed ? "emerald" : "outline"}
              className={cn(
                reward.claimed
                  ? "border-emerald/30 text-emerald"
                  : "border-white/15 text-white/70"
              )}
            >
              {reward.claimed ? "Claimed" : "Locked"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

const MiniStatsRow = ({ stats }: { stats: StreakStats }) => {
  const items = [
    {
      label: "Active (7d/30d)",
      value: `${stats.activeDays7}/${stats.activeDays30}`,
    },
    {
      label: "Consistency (7d)",
      value: `${Math.round(stats.consistency7 * 100)}%`,
    },
    {
      label: "Deposits (7d)",
      value: `${stats.deposits7} · $${formatNumber(
        stats.depositSum7,
        0,
        stats.depositSum7 < 1000 ? 2 : 0
      )}`,
    },
    {
      label: "Last event",
      value: formatLocalTime(stats.lastEventAt),
    },
  ];

  return (
    <div className="grid gap-2 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
        >
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            {item.label}
          </div>
          <div className="font-mono text-sm text-white tabular-nums">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const HistoryGroup = ({
  group,
}: {
  group: { dayKey: string; items: StreakEvent[] };
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs font-medium text-white/60">
      <span>{format(new Date(group.dayKey), "MMM d, yyyy")}</span>
      <span>
        {group.items.length} event{s(group.items.length)}
      </span>
    </div>
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {group.items.map((event) => (
        <div
          key={`${event.at}-${event.type}`}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-[#101113] px-4 py-3"
        >
          <div className="flex flex-col">
            <span className="font-mono text-sm text-white">
              {format(new Date(event.at), "HH:mm:ss")}
            </span>
            <span className="text-[11px] text-white/45">
              {format(new Date(event.at), "zzzz")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {prettyAmount(event.amountUsd) && (
              <span className="font-mono text-sm text-white/70 tabular-nums">
                {prettyAmount(event.amountUsd)}
              </span>
            )}
            <Badge variant="outline" className="border-white/15 text-white/80">
              {event.type === "deposit" ? "Deposit" : "Snapshot"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const collectHistoryGroups = (events: StreakEvent[]) => {
  const grouped = new Map<string, StreakEvent[]>();
  events.forEach((event) => {
    const bucket = grouped.get(event.dayKey) ?? [];
    bucket.push(event);
    grouped.set(event.dayKey, bucket);
  });
  return Array.from(grouped.entries())
    .map(([dayKey, items]) => ({
      dayKey,
      items: items.sort((a, b) => b.at - a.at),
    }))
    .sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
};

export const StreakModal = ({
  record,
  events,
  rewards,
  stats,
  vaultId,
  wallet,
  onSeedDemo,
  onPrimaryAction,
  coveredToday,
}: StreakModalProps) => {
  const { isMd } = useBreakpoint();
  const isDev = import.meta.env.DEV;
  const [historyRange, setHistoryRange] = useState<7 | 30>(7);

  const filteredEvents = useMemo(() => {
    const threshold = Date.now() - (historyRange - 1) * DAY_MS;
    return events.filter((event) => event.at >= threshold);
  }, [events, historyRange]);

  const groupedHistory = useMemo(
    () => collectHistoryGroups(filteredEvents),
    [filteredEvents]
  );

  const milestonePips = useMemo<MilestonePip[]>(() => {
    if (!rewards.length) {
      return [3, 7, 14, 30].map((threshold) => ({
        threshold,
        state:
          stats.current >= threshold
            ? "reached"
            : stats.nextMilestone === threshold
            ? "next"
            : "locked",
      }));
    }
    return rewards.map((reward) => ({
      threshold: reward.threshold,
      state:
        reward.claimed
          ? "reached"
          : stats.nextMilestone === reward.threshold
          ? "next"
          : "locked",
      reward,
    }));
  }, [rewards, stats.current, stats.nextMilestone]);

  const walletPreview = wallet
    ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
    : "Connect a wallet to start tracking.";

  return (
    <DialogContent hideIconClose className="max-w-2xl rounded-2xl border border-white/10 bg-[#0B0D12]/95 backdrop-blur">
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-white text-xl font-semibold">
          Streak Tracker
        </DialogTitle>
        <div className="text-xs text-white/60">
          Tracking streak for {walletPreview} · {vaultId}
        </div>
      </DialogHeader>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/15">
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white/15">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <div className="mt-4 space-y-4">
            <StreakHero
              stats={stats}
              coveredToday={coveredToday}
              onPrimaryAction={onPrimaryAction}
            />
            <MiniStatsRow stats={stats} />
            <MilestoneRail pips={milestonePips} />
            <RewardsList rewards={rewards} />
            <div className="text-[11px] text-white/50">
              Maintained by holding NDLP across midnight UTC or making one deposit per day.
            </div>
            {isDev && onSeedDemo && (
              <button
                type="button"
                className="text-xs text-white/50 underline decoration-dotted decoration-white/40"
                onClick={() => onSeedDemo?.()}
              >
                Seed demo streak data
              </button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="focus-visible:outline-none">
          <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
            <span>Showing</span>
            <div className="flex gap-1">
              {[7, 30].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setHistoryRange(range as 7 | 30)}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    historyRange === range
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 text-white/60 hover:border-white/20"
                  )}
                >
                  {range === 7 ? "This week" : "30 days"}
                </button>
              ))}
            </div>
          </div>

          <ConditionRenderer
            when={events.length > 0}
            fallback={
              <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-[#101114] p-6 text-center">
                <div className="text-white font-semibold text-base mb-1">
                  No streak yet
                </div>
                <div className="text-white/60 text-sm">
                  Make a deposit or hold NDLP across midnight UTC to start your streak.
                </div>
              </div>
            }
          >
            <ScrollArea className="mt-4 max-h-[360px] pr-3">
              <div className="space-y-4">
                {groupedHistory.map((group) => (
                  <HistoryGroup key={group.dayKey} group={group} />
                ))}
              </div>
            </ScrollArea>
          </ConditionRenderer>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};
