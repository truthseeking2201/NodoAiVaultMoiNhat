import { useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { QuestSummaryCard } from "@/components/quest/cards/QuestSummaryCard";
import { StreakTrackerCard } from "@/components/quest/cards/StreakTrackerCard";
import { QuestCard } from "@/components/quest/QuestCard";
import { HistoryList } from "@/components/quest/HistoryList";
import { useQuest } from "@/hooks/useQuest";
import { QuestRuntime } from "@/lib/quest-state";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle ? (
        <p className="text-sm text-white/60">{subtitle}</p>
      ) : null}
    </div>
  );
}

type QuestGridProps = {
  items: QuestRuntime[];
  onStart: (id: QuestRuntime["id"]) => void;
  onClaim: (id: QuestRuntime["id"]) => void;
  emptyMessage?: string;
};

function QuestGrid({
  items,
  onStart,
  onClaim,
  emptyMessage,
}: QuestGridProps) {
  if (!items.length) {
    return emptyMessage ? (
      <p className="text-sm text-white/60">{emptyMessage}</p>
    ) : null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {items.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onStart={onStart}
          onClaim={onClaim}
        />
      ))}
    </div>
  );
}

export default function QuestPage() {
  const { active, available, locked, history, summary, start, claim } =
    useQuest();

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const aDate = a.completedAt ?? a.failedAt ?? "";
      const bDate = b.completedAt ?? b.failedAt ?? "";
      return bDate.localeCompare(aDate);
    });
  }, [history]);

  return (
    <PageContainer className="max-w-[1200px] py-10 space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <QuestSummaryCard
            totalXp={summary.totalXpEarned}
            pendingXp={summary.totalXpPotential}
            currentStreak={summary.currentStreak}
            longestStreak={summary.longestStreak}
            nextMilestone={summary.nextMilestone}
            onViewStreak={() => {
              const node = document.getElementById("quest-streak");
              node?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
          <div id="quest-streak">
            <StreakTrackerCard
              current={summary.currentStreak}
              longest={summary.longestStreak}
              todayDone={summary.todayDone}
              resetInMs={summary.resetInMs}
              milestones={summary.milestones}
            />
          </div>
        </div>

        <section className="space-y-4">
          <SectionTitle
            title="Active quests"
            subtitle="Finish these to unlock XP Shares and streak milestones."
          />
          <QuestGrid
            items={active}
            onStart={start}
            onClaim={claim}
            emptyMessage="No quests running right now."
          />
        </section>

        <section className="space-y-4">
          <SectionTitle
            title="Available quests"
            subtitle="Kick off a quest to auto-track deposits and holdings."
          />
          <QuestGrid
            items={available}
            onStart={start}
            onClaim={claim}
            emptyMessage="Check back soon for new quests."
          />
        </section>

        {locked.length > 0 && (
          <section className="space-y-4">
            <SectionTitle
              title="Locked quests"
              subtitle="Meet the requirements to unlock these rewards."
            />
            <QuestGrid items={locked} onStart={start} onClaim={claim} />
          </section>
        )}

        <section className="space-y-4 pb-12">
          <SectionTitle
            title="History"
            subtitle="Track what you have claimed so far."
          />
          <HistoryList items={sortedHistory} />
        </section>
      </div>
    </PageContainer>
  );
}
