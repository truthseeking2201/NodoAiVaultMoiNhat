import { Badge } from "@/components/ui/badge";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConditionRenderer from "@/components/shared/condition-renderer";
import useBreakpoint from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getMilestoneProgress } from "../logic";
import { StreakEvent, StreakRecord } from "../types";

const formatEventTime = (timestamp: number) => {
  try {
    return format(new Date(timestamp), "MMM d, yyyy • HH:mm:ss xxx");
  } catch (error) {
    return "--";
  }
};

type OverviewCardProps = {
  label: string;
  value: string;
  description?: string;
};

const OverviewCard = ({ label, value, description }: OverviewCardProps) => (
  <div className="rounded-xl border border-white/10 bg-[#101114] px-4 py-3">
    <div className="text-xs text-white/60 mb-1 uppercase tracking-wide">
      {label}
    </div>
    <div className="text-white font-mono text-2xl">{value}</div>
    <ConditionRenderer when={!!description}>
      <div className="text-xs text-white/50 mt-1">{description}</div>
    </ConditionRenderer>
  </div>
);

type StreakModalProps = {
  record: StreakRecord | null;
  events: StreakEvent[];
  vaultId: string;
  wallet?: string;
};

const EMPTY_STATE_COPY = {
  title: "No streak yet",
  description:
    "Make a deposit or hold NDLP across midnight UTC to start your streak.",
};

const formatTypeCopy = (type: StreakEvent["type"]) =>
  type === "deposit" ? "Deposit" : "Holding snapshot";

const getOverviewCards = (record: StreakRecord | null) => {
  const current = record?.current ?? 0;
  const longest = record?.longest ?? 0;
  const progress = getMilestoneProgress(current);
  const hasNext = progress.next > current;
  const nextMilestoneLabel = hasNext
    ? `${progress.next} days`
    : "Complete";
  const daysRemaining = hasNext ? progress.next - current : 0;

  return {
    cards: [
      {
        label: "Current streak",
        value: `${current} day${current === 1 ? "" : "s"}`,
      },
      {
        label: "Longest streak",
        value: `${longest} day${longest === 1 ? "" : "s"}`,
      },
      {
        label: "Next milestone",
        value: nextMilestoneLabel,
        description: hasNext
          ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} to go`
          : "You have reached the highest milestone",
      },
    ],
    progress,
  } as const;
};

export const StreakModal = ({ record, events, vaultId, wallet }: StreakModalProps) => {
  const { isMd } = useBreakpoint();
  const { cards, progress } = getOverviewCards(record);
  const noEvents = events.length === 0;

  return (
    <DialogContent hideIconClose className="max-w-2xl">
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-white text-xl font-semibold">
          Streak Tracker
        </DialogTitle>
        <div className="text-sm text-white/60">
          {wallet
            ? `Tracking streak for ${wallet.slice(0, 6)}…${wallet.slice(-4)} in ${vaultId}`
            : "Connect a wallet to start tracking streaks."}
        </div>
      </DialogHeader>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="bg-transparent border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white/10">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <div
            className={cn(
              "mt-4 grid gap-3",
              isMd ? "grid-cols-3" : "grid-cols-1"
            )}
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

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Progress to milestone</span>
              <span className="font-mono text-white">
                {Math.round(progress.percent)}%
              </span>
            </div>
            <Progress value={progress.percent} className="h-2" />
            <div className="text-xs text-white/50">
              Maintained by holding NDLP across midnight UTC or making a deposit once per day.
            </div>
          </div>
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
            <ScrollArea className="mt-4 max-h-[320px] pr-4">
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={`${event.dayKey}-${event.type}-${event.at}`}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0C0D11] px-4 py-3"
                  >
                    <div>
                      <div className="font-mono text-sm text-white">
                        {event.dayKey}
                      </div>
                      <div className="text-xs text-white/50">
                        {formatEventTime(event.at)}
                      </div>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white/80">
                      {formatTypeCopy(event.type)}
                    </Badge>
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
