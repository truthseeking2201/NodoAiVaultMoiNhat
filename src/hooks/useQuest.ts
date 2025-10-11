import { useCallback, useEffect, useMemo, useState } from "react";
import { mockQuestService } from "@/data/quest-mocks";
import { QuestRuntime, QuestId } from "@/lib/quest-state";

const service = mockQuestService();

type QuestSummary = {
  totalXpEarned: number;
  totalXpPotential: number;
  currentStreak: number;
  longestStreak: number;
  nextMilestone: {
    day: number;
    xp: number;
  };
  resetInMs: number;
  todayDone: boolean;
  milestones: { days: number; xp: number }[];
};

const DEFAULT_MILESTONES = [
  { days: 1, xp: 100 },
  { days: 3, xp: 300 },
  { days: 7, xp: 1_000 },
  { days: 14, xp: 2_400 },
  { days: 30, xp: 6_000 },
];

export function useQuest() {
  const [items, setItems] = useState<QuestRuntime[]>([]);

  useEffect(() => {
    const seeded = service.seedDemo();
    setItems(seeded ?? service.list());
  }, []);

  const refresh = useCallback(() => {
    setItems(service.list());
  }, []);

  const start = useCallback((id: QuestId) => {
    service.start(id);
    refresh();
  }, [refresh]);

  const claim = useCallback((id: QuestId) => {
    service.claim(id);
    refresh();
  }, [refresh]);

  const fail = useCallback((id: QuestId) => {
    service.fail(id);
    refresh();
  }, [refresh]);

  const markClaimable = useCallback((id: QuestId) => {
    service.markClaimable(id);
    refresh();
  }, [refresh]);

  const active = useMemo(
    () =>
      items.filter((quest) =>
        ["active", "claimable"].includes(quest.state)
      ),
    [items]
  );

  const available = useMemo(
    () => items.filter((quest) => quest.state === "available"),
    [items]
  );

  const locked = useMemo(
    () => items.filter((quest) => quest.state === "locked"),
    [items]
  );

  const history = useMemo(
    () =>
      items.filter((quest) =>
        ["completed", "failed"].includes(quest.state)
      ),
    [items]
  );

  const summary: QuestSummary = useMemo(() => {
    const totalXpEarned = history.reduce(
      (sum, quest) => sum + quest.rewardXp,
      0
    );
    const totalXpPotential = items.reduce(
      (sum, quest) =>
        ["completed", "failed"].includes(quest.state)
          ? sum
          : sum + quest.rewardXp,
      0
    );
    return {
      totalXpEarned,
      totalXpPotential,
      currentStreak: 2,
      longestStreak: 9,
      nextMilestone: { day: 3, xp: 300 },
      resetInMs: 12 * 60 * 60 * 1000,
      todayDone: false,
      milestones: DEFAULT_MILESTONES,
    };
  }, [history, items]);

  return {
    items,
    active,
    available,
    locked,
    history,
    summary,
    start,
    claim,
    fail,
    markClaimable,
    refresh,
  };
}
