import { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Quest } from "@/lib/quest-types";
import {
  mapQuestToTab,
  questTabs,
  type QuestTab,
} from "@/lib/quest-tabs";
import { QuestList } from "@/components/quest/QuestList";

type QuestTabsProps = {
  quests: Quest[];
  onStart: (id: string) => void;
  onClaim: (id: string) => void;
  onDeposit: (id: string, amountUsd?: number) => void;
};

const emptyCopy: Record<QuestTab, string> = {
  claim: "No claimable quests right now — finish a quest to see it here.",
  active: "No active quests — start one to begin tracking.",
  available: "No available quests — check back soon.",
  upcoming: "All caught up — upcoming quests will appear here.",
  completed: "You haven’t completed a quest yet.",
  failed: "No failed quests — keep it up!",
};

export function QuestTabs({
  quests,
  onStart,
  onClaim,
  onDeposit,
}: QuestTabsProps) {
  const groups = useMemo(() => {
    const bucket: Record<QuestTab, Quest[]> = {
      claim: [],
      active: [],
      available: [],
      upcoming: [],
      completed: [],
      failed: [],
    };
    quests.forEach((quest) => {
      bucket[mapQuestToTab(quest.state)].push(quest);
    });
    return bucket;
  }, [quests]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        questTabs.map((tab) => [tab.value, groups[tab.value].length])
      ) as Record<QuestTab, number>,
    [groups]
  );

  const firstTabWithItems =
    questTabs.find((tab) => groups[tab.value].length > 0)?.value ??
    questTabs[0].value;

  const [value, setValue] = useState<QuestTab>(firstTabWithItems);

  useEffect(() => {
    if (groups[value].length === 0 && counts[value] === 0) {
      setValue(firstTabWithItems);
    }
  }, [counts, groups, value, firstTabWithItems]);

  return (
    <Tabs value={value} onValueChange={(next) => setValue(next as QuestTab)}>
      <div className="sticky top-[64px] z-10 rounded-xl border border-white/10 bg-black/50 p-2 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <TabsList className="grid w-full grid-cols-1 gap-2 bg-transparent md:grid-cols-3 lg:grid-cols-6">
          {questTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg bg-transparent px-3 py-2 text-xs font-medium text-white/70 transition data-[state=active]:bg-white/10 data-[state=active]:text-white md:text-sm"
            >
              {tab.label} ({counts[tab.value]})
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {questTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          <QuestList
            items={groups[tab.value]}
            emptyText={emptyCopy[tab.value]}
            onStart={onStart}
            onClaim={onClaim}
            onDeposit={onDeposit}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
