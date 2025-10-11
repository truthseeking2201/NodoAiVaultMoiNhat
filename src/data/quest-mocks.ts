import {
  QuestDefinition,
  QuestRuntime,
  QuestId,
} from "@/lib/quest-state";

export const QUEST_DEFS: QuestDefinition[] = [
  {
    id: "welcome_deposit_5",
    kind: "deposit_once",
    title: "Deposit $5 to earn 500 XP Shares",
    minDepositUsd: 5,
    rewardXp: 500,
  },
  {
    id: "deposit_50",
    kind: "deposit_once",
    title: "Deposit $50 to earn 2,000 XP Shares",
    minDepositUsd: 50,
    rewardXp: 2000,
  },
  {
    id: "streak_3d",
    kind: "streak",
    title: "Complete a 3-day deposit streak",
    streakDays: 3,
    rewardXp: 3000,
  },
  {
    id: "hold_7",
    kind: "hold_days",
    title: "Hold balance ≥ $25 for 7 days",
    minDepositUsd: 25,
    holdDays: 7,
    rewardXp: 3500,
  },
  {
    id: "hold_30",
    kind: "hold_days",
    title: "Hold balance ≥ $100 for 30 days",
    minDepositUsd: 100,
    holdDays: 30,
    rewardXp: 10000,
  },
  {
    id: "highroller_500",
    kind: "highroller",
    title: "Deposit ≥ $500 and hold 14 days",
    minDepositUsd: 500,
    holdDays: 14,
    rewardXp: 20000,
  },
];

type RuntimeMap = Record<QuestId, QuestRuntime>;

let RUNTIME: RuntimeMap = Object.fromEntries(
  QUEST_DEFS.map((definition) => [
    definition.id,
    {
      ...definition,
      state: "locked",
      progressPct: 0,
    },
  ])
) as RuntimeMap;

let seeded = false;

export function mockQuestService() {
  return {
    list(): QuestRuntime[] {
      return Object.values(RUNTIME);
    },
    start(id: QuestId) {
      const quest = RUNTIME[id];
      if (!quest) {
        return;
      }
      const now = new Date();
      quest.state = "active";
      quest.startedAt = now.toISOString();
      if (quest.holdDays) {
        const end = new Date(
          now.getTime() + quest.holdDays * 24 * 60 * 60 * 1000
        );
        quest.claimableAt = end.toISOString();
        quest.progressPct = Math.min(quest.progressPct ?? 0, 10);
      } else if (quest.streakDays) {
        quest.progressPct = Math.min(quest.progressPct ?? 0, 33);
      } else {
        quest.claimableAt = now.toISOString();
        quest.state = "claimable";
        quest.progressPct = 100;
      }
    },
    markClaimable(id: QuestId) {
      const quest = RUNTIME[id];
      if (!quest) {
        return;
      }
      quest.state = "claimable";
      quest.claimableAt = new Date().toISOString();
      quest.progressPct = 100;
    },
    claim(id: QuestId) {
      const quest = RUNTIME[id];
      if (!quest) {
        return;
      }
      quest.state = "completed";
      quest.completedAt = new Date().toISOString();
      quest.progressPct = 100;
    },
    fail(id: QuestId) {
      const quest = RUNTIME[id];
      if (!quest) {
        return;
      }
      quest.state = "failed";
      quest.failedAt = new Date().toISOString();
    },
    setAvailable(ids: QuestId[]) {
      ids.forEach((id) => {
        const quest = RUNTIME[id];
        if (quest && quest.state === "locked") {
          quest.state = "available";
        }
      });
    },
    seedDemo() {
      if (seeded) {
        return this.list();
      }
      this.setAvailable(["welcome_deposit_5", "deposit_50", "streak_3d"]);
      const holdSeven = RUNTIME["hold_7"];
      holdSeven.state = "active";
      holdSeven.progressPct = 40;
      holdSeven.startedAt = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString();
      holdSeven.claimableAt = new Date(
        Date.now() + 4 * 24 * 60 * 60 * 1000
      ).toISOString();
      seeded = true;
      return this.list();
    },
    reset() {
      RUNTIME = Object.fromEntries(
        QUEST_DEFS.map((definition) => [
          definition.id,
          {
            ...definition,
            state: "locked",
            progressPct: 0,
          },
        ])
      ) as RuntimeMap;
      seeded = false;
    },
  };
}
