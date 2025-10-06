import { Badge } from "@/components/ui/badge";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConditionRenderer from "@/components/shared/condition-renderer";
import useBreakpoint from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  getMilestoneProgress,
  MILESTONES,
} from "../logic";
import {
  StreakEvent,
  StreakRecord,
  StreakReward,
  StreakStats,
} from "../types";
import { formatNumber } from "@/lib/number";

type OverviewCardProps = {
  label: string;
  value: string;
  description?: string;
};

const OverviewCard = ({ label, value, description }: OverviewCardProps) => (
  <div className="rounded-xl border border-white/10 bg-[#12141a] px-4 py-3">
    <div className="mb-1 text-xs uppercase tracking-[0.18em] text-white/50">
      {label}
    </div>
    <div className="text-2xl font-mono text-white tabular-nums">{value}</div>
    <ConditionRenderer when={!!description}>
      <div className="mt-1 text-xs text-white/60">{description}</div>
    </ConditionRenderer>
  </div>
);

type StreakModalProps = {
  record: StreakRecord | null;
  events: StreakEvent[];
  rewards: StreakReward[];
  stats: StreakStats;
  vaultId: string;
  wallet?: string;
  onSeedDemo?: () => void;
};

const EMPTY_STATE_COPY = {
  title: "No streak yet",
  description:
    "Make a deposit or hold NDLP across midnight UTC to start your streak.",
};

const formatTypeCopy = (type: StreakEvent["type"]) =>
  type === "deposit" ? "Deposit" : "Holding snapshot";

const getOverviewCards = (record: StreakRecord | null, stats: StreakStats) => {
  const current = record?.current ?? 0;
  const longest = record?.longest ?? 0;
  const progress = getMilestoneProgress(current);
  const hasNext = progress.next > current;
  const nextMilestoneLabel = hasNext
    ? `${progress.next} days`
    : "Complete";
  const daysRemaining = Math.max(0, stats.daysToNext);
  const etaLabel = hasNext
    ? format(new Date(stats.etaNextDate), "MMM d")
    : "—";

  return {
    cards: [
      {
        label: "Current streak",
        value: `${current} day${current === 1 ? "" : "s"}`,
        description: stats.runStart
          ? `Since ${format(new Date(stats.runStart), "MMM d")}`
          : undefined,
      },
      {
        label: "Longest streak",
        value: `${longest} day${longest === 1 ? "" : "s"}`,
      },
      {
        label: "Next milestone",
        value: nextMilestoneLabel,
        description: hasNext
          ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} to go • ETA ${etaLabel}`
          : "You have reached the highest milestone",
      },
    ],
    progress,
  } as const;
};

const MilestoneBar = ({ current, ticks }: { current: number; ticks: number[] }) => {
  const milestones = ticks.length ? ticks : [3, 7, 14, 30];
  const maxMilestone = milestones[milestones.length - 1];
  const capped = Math.min(current, maxMilestone);
  const fillPercent = (capped / maxMilestone) * 100;

  return (
    <div className="mt-3">
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-white/40 via-white/60 to-white/80 transition-[width] duration-500"
          style={{ width: `${Math.min(100, fillPercent)}%` }}
        />
        {milestones.map((milestone) => {
          const position = (milestone / maxMilestone) * 100;
          const achieved = current >= milestone;
          return (
            <div
              key={milestone}
              className={cn(
                "absolute top-1/2 h-3 w-[1px] -translate-y-1/2 bg-white/20",
                achieved && "bg-white/70"
              )}
              style={{ left: `${position}%` }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-white/40">
        {milestones.map((milestone) => (
          <span key={milestone} className="tabular-nums">
            {milestone}d
          </span>
        ))}
      </div>
    </div>
  );
};

const formatLocalTime = (timestamp?: number) => {
  if (!timestamp) return "--";
  try {
    return format(new Date(timestamp), "MMM d, yyyy · HH:mm");
  } catch (error) {
    return "--";
  }
};

const groupHistory = (events: StreakEvent[]) => {
  const grouped = new Map<string, StreakEvent[]>();
  events.forEach((event) => {
    const list = grouped.get(event.dayKey) ?? [];
    list.push(event);
    grouped.set(event.dayKey, list);
  });
  return Array.from(grouped.entries())
    .map(([dayKey, items]) => ({
      dayKey,
      items: items.sort((a, b) => b.at - a.at),
    }))
    .sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
};

const prettyAmount = (amount?: number) => {
  if (!amount) return null;
  if (amount >= 1000) return `$${formatNumber(amount, 0, 0)}`;
  return `$${formatNumber(amount, 0, 2)}`;
};

const RewardsList = ({ rewards }: { rewards: StreakReward[] }) => (
  <div className="mt-4 space-y-1 rounded-xl border border-white/10 bg-[#101216] p-3">
    <div className="text-xs uppercase tracking-[0.18em] text-white/40">
      Rewards Timeline
    </div>
    <div className="space-y-1.5">
      {rewards.map((reward) => (
        <div
          key={reward.threshold}
          className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2"
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
            className={reward.claimed ? "border-emerald/30" : "border-white/15 text-white/70"}
          >
            {reward.claimed ? "Claimed" : "Locked"}
          </Badge>
        </div>
      ))}
    </div>
  </div>
);

const MiniStatsRow = ({ stats }: { stats: StreakStats }) => {
  const items = [
    {
      label: "Active (7d/30d)",
      value: `${stats.activeDays7} / ${stats.activeDays30}`,
    },
    {
      label: "Consistency (7d)",
      value: `${Math.round(stats.consistency7 * 100)}%`,
    },
    {
      label: "Deposits (7d)",
      value: `${stats.deposits7} · $${formatNumber(stats.depositSum7, 0, stats.depositSum7 < 1000 ? 2 : 0)}`,
    },
    {
      label: "Last event",
      value: formatLocalTime(stats.lastEventAt),
    },
  ];
  return (
    <div className="mt-4 grid gap-2 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
        >
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            {item.label}
          </div>
          <div className="font-mono text-sm text-white tabular-nums truncate">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export const StreakModal = ({
  record,
  events,
  rewards,
  stats,
  vaultId,
  wallet,
  onSeedDemo,
}: StreakModalProps) => {
  const { isMd } = useBreakpoint();
  const { cards, progress } = getOverviewCards(record, stats);
  const noEvents = events.length === 0;
  const groupedHistory = groupHistory(events);
  const walletPreview = wallet
    ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
    : "Connect a wallet to start tracking.";
  const milestoneTicks = rewards.length
    ? rewards.map((reward) => reward.threshold).filter((threshold) => threshold <= 60)
    : MILESTONES.filter((threshold) => threshold <= 30);
  const isDev = import.meta.env.DEV;

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
          <div className={cn("mt-4 grid gap-3", isMd ? "grid-cols-3" : "grid-cols-1")}
          >
            {cards.map((card) => (
              <OverviewCard
                key={card.label}
                label={card.label}
                value={card.value}
                description={card.description}
              />
            ))}
          </div>

          <MiniStatsRow stats={stats} />

          <MilestoneBar current={record?.current ?? 0} ticks={milestoneTicks} />

          <div className="mt-2 flex items-center justify-between text-[11px] text-white/55">
            <span>Progress to next milestone</span>
            <span className="font-mono text-white/80">{Math.round(progress.percent)}%</span>
          </div>

          <div className="mt-3 text-[11px] text-white/50">
            Maintained by holding NDLP across midnight UTC or making a deposit once per day.
          </div>

          <RewardsList rewards={rewards} />

          {isDev && onSeedDemo && (
            <button
              type="button"
              className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
              onClick={() => onSeedDemo?.()}
            >
              Seed demo streak data
            </button>
          )}
        </TabsContent>

        <TabsContent value="history" className="focus-visible:outline-none">
          <ConditionRenderer
            when={!noEvents}
            fallback={
              <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-[#101114] p-6 text-center">
                <div className="text-white font-semibold text-base mb-1">
                  {EMPTY_STATE_COPY.title}
                </div>
                <div className="text-white/60 text-sm">
                  {EMPTY_STATE_COPY.description}
                </div>
              </div>
            }
          >
            <ScrollArea className="mt-4 max-h-[360px] pr-3">
              <div className="space-y-4">
                {groupedHistory.map((group) => (
                  <div key={group.dayKey} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-white/60">
                      <span>{format(new Date(group.dayKey), "MMM d, yyyy")}</span>
                      <span>{group.items.length} event{group.items.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="space-y-2">
                      {group.items.map((event) => (
                        <div
                          key={`${event.at}-${event.type}`}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0C0D11] px-4 py-3"
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
                            {event.amountUsd ? (
                              <span className="font-mono text-sm text-white/70 tabular-nums">
                                {prettyAmount(event.amountUsd)}
                              </span>
                            ) : null}
                            <Badge variant="outline" className="border-white/15 text-white/80">
                              {formatTypeCopy(event.type)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ConditionRenderer>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};
