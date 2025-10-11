import { Quest, QuestState } from "@/lib/quest-types";

const QUEST_ORDER = ["welcome_5", "deposit_50", "highroller_500"] as const;

let QUESTS: Quest[] = [
  {
    id: "welcome_5",
    kind: "deposit_once",
    title: "Deposit $5 to earn 500 XP Shares",
    description: "Make a one-time deposit of at least $5. No hold period required.",
    rewardXp: 500,
    minDepositUsd: 5,
    state: "available",
  },
  {
    id: "deposit_50",
    kind: "deposit_once",
    title: "Deposit $50 to earn 2,000 XP Shares",
    description: "Deposit at least $50 within 24 hours after starting this quest.",
    rewardXp: 2000,
    minDepositUsd: 50,
    state: "locked",
    lockedReason: "tier_not_unlocked",
  },
  {
    id: "hold_7",
    kind: "hold_days",
    title: "Hold balance ≥ $25 for 7 days",
    description: "Maintain a vault balance of $25 or more for 7 consecutive days.",
    rewardXp: 3500,
    holdDays: 7,
    holdThresholdUsd: 25,
    state: "active",
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    progressPct: 43,
  },
  {
    id: "highroller_500",
    kind: "highroller",
    title: "Deposit $500 and hold 14 days for 20,000 XP",
    description: "Deposit at least $500 and keep it for 14 days to unlock a massive XP reward.",
    rewardXp: 20000,
    minDepositUsd: 500,
    holdDays: 14,
    state: "locked",
    lockedReason: "tier_not_unlocked",
  },
];

const setState = (id: Quest["id"], state: QuestState) => {
  QUESTS = QUESTS.map((quest) =>
    quest.id === id
      ? {
          ...quest,
          state,
        }
      : quest
  );
};

const updateQuest = (id: Quest["id"], updater: (quest: Quest) => Quest) => {
  QUESTS = QUESTS.map((quest) =>
    quest.id === id ? updater({ ...quest }) : quest
  );
};

export function questMockService() {
  return {
    list(): Quest[] {
      return QUESTS.map((quest) => ({ ...quest }));
    },
    setAvailable(id: Quest["id"]) {
      updateQuest(id, (quest) =>
        quest.state === "locked"
          ? { ...quest, state: "available", lockedReason: undefined }
          : quest
      );
    },
    start(id: Quest["id"]) {
      updateQuest(id, (quest) => {
        if (quest.state !== "available") {
          return quest;
        }
        const endAt =
          quest.kind === "deposit_once"
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            : quest.kind === "highroller"
              ? new Date(
                  Date.now() +
                    (quest.holdDays ?? 14) * 24 * 60 * 60 * 1000
                ).toISOString()
              : quest.endAt;
        return {
          ...quest,
          state: "active",
          startedAt: new Date().toISOString(),
          endAt,
          lockedReason: undefined,
        };
      });
    },
    markClaimable(id: Quest["id"]) {
      updateQuest(id, (quest) => ({
        ...quest,
        state: "claimable",
        claimableAt: new Date().toISOString(),
        progressPct: 100,
      }));
    },
    claim(id: Quest["id"]) {
      updateQuest(id, (quest) => {
        if (quest.state !== "claimable") {
          return quest;
        }
        return {
          ...quest,
          state: "completed",
          completedAt: new Date().toISOString(),
        };
      });
    },
    fail(id: Quest["id"]) {
      setState(id, "failed");
    },
    onDepositConfirmed(amountUsd: number) {
      const activeDepositQuest = QUESTS.find(
        (quest) =>
          quest.state === "active" &&
          (quest.kind === "deposit_once" || quest.kind === "highroller") &&
          amountUsd >= (quest as any).minDepositUsd
      );
      if (!activeDepositQuest) {
        return;
      }

      this.markClaimable(activeDepositQuest.id);

      if (activeDepositQuest.id === "welcome_5") {
        this.setAvailable("deposit_50");
      }
      if (activeDepositQuest.id === "deposit_50") {
        this.setAvailable("highroller_500");
      }
    },
  };
}
