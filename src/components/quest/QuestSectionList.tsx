import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { Quest } from "@/lib/quest-types";
import { QuestCard } from "@/components/quest/cards/QuestCard";

type QuestSectionListProps = {
  quests: Quest[];
  onStart: (id: string) => void;
  onClaim: (id: string) => void;
  onDeposit: (quest: Quest, amountUsd?: number) => void;
};

const xpBadgeTone = (rewardXp: number) => {
  if (rewardXp <= 3_000) {
    return "bg-emerald-400/20 text-emerald-200 border-emerald-400/30";
  }
  if (rewardXp <= 6_000) {
    return "bg-cyan-400/20 text-cyan-200 border-cyan-400/30";
  }
  if (rewardXp <= 10_000) {
    return "bg-purple-400/20 text-purple-200 border-purple-400/30";
  }
  return "bg-amber-400/20 text-amber-200 border-amber-400/40";
};

const statusCopy: Record<Quest["state"], string> = {
  available: "Available",
  active: "In Progress",
  claimable: "Claimable",
  completed: "Completed",
  failed: "Failed",
  locked: "Locked",
};

const statusTone: Record<Quest["state"], string> = {
  available: "bg-white/8 text-white/70 border-white/15",
  active: "bg-cyan-400/20 text-cyan-200 border-cyan-400/30",
  claimable: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30",
  completed: "bg-purple-400/20 text-purple-200 border-purple-400/30",
  failed: "bg-rose-400/20 text-rose-200 border-rose-400/30",
  locked: "bg-amber-400/15 text-amber-200 border-amber-400/30",
};

export function QuestSectionList({
  quests,
  onStart,
  onClaim,
  onDeposit,
}: QuestSectionListProps) {
  if (!quests.length) {
    return null;
  }

  return (
    <Accordion
      type="multiple"
      className="divide-y divide-white/10 border-y border-white/10"
    >
      {quests.map((quest) => (
        <AccordionItem
          key={quest.id}
          value={quest.id}
          className="border-none first:rounded-t-2xl last:rounded-b-2xl"
        >
          <AccordionTrigger
            className={cn(
              "group relative flex w-full items-center gap-4 px-4 py-5 text-left outline-none transition",
              "hover:bg-white/4",
              "data-[state=open]:bg-white/6"
            )}
          >
            <span
              className={cn(
                "inline-flex min-w-[90px] items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                xpBadgeTone(quest.rewardXp)
              )}
            >
              XP {quest.rewardXp.toLocaleString()}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium leading-tight text-white/90 sm:text-base">
                  {quest.title}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    statusTone[quest.state]
                  )}
                >
                  {statusCopy[quest.state]}
                </span>
              </div>
              <p className="text-xs text-white/55 sm:text-sm sm:text-white/60">
                {quest.description}
              </p>
            </div>
            <div className="hidden items-center gap-2 text-xs text-white/45 sm:flex">
              <span>Details</span>
              <span className="h-6 w-6 rounded-full border border-white/10 bg-white/5 text-white/60 transition group-data-[state=open]:rotate-45 group-data-[state=open]:text-emerald-200">
                +
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="bg-white/5 px-4 pb-6 pt-0">
            <QuestCard
              quest={quest}
              onStart={onStart}
              onClaim={onClaim}
              onDeposit={(questItem, amountUsd) =>
                onDeposit(questItem, amountUsd)
              }
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
