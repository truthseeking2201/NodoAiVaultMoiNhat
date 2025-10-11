import { DepositQuest } from "@/lib/quest-state";

type QuestState = DepositQuest["state"];

type QuestConfig = Pick<
  DepositQuest,
  "id" | "title" | "minDepositUsd" | "rewardXp" | "targetVaultId"
>;

const QUEST_CONFIG: QuestConfig[] = [
  {
    id: "welcome_deposit_5",
    title: "Deposit $5 to earn 500 XP Shares",
    minDepositUsd: 5,
    rewardXp: 500,
  },
  {
    id: "deposit_50",
    title: "Deposit $50 to earn 2,000 XP Shares",
    minDepositUsd: 50,
    rewardXp: 2000,
  },
  {
    id: "highroller_500",
    title: "Deposit $500 and hold 14 days for 20,000 XP",
    minDepositUsd: 500,
    rewardXp: 20000,
  },
];

const QUEST_ORDER = QUEST_CONFIG.map((quest) => quest.id);

let QUESTS: DepositQuest[] = QUEST_CONFIG.map((quest, index) => ({
  ...quest,
  state: index === 0 ? "available" : "locked",
}));

const updateQuest = (
  id: DepositQuest["id"],
  updater: (quest: DepositQuest) => DepositQuest
) => {
  QUESTS = QUESTS.map((quest) =>
    quest.id === id ? updater({ ...quest }) : quest
  );
};

export function questService() {
  return {
    list(): DepositQuest[] {
      return QUESTS.map((quest) => ({ ...quest }));
    },
    start(id: DepositQuest["id"]) {
      updateQuest(id, (quest) => {
        if (quest.state !== "available") {
          return quest;
        }
        return {
          ...quest,
          state: "active",
          startedAt: new Date().toISOString(),
        };
      });
    },
    onDepositConfirmed(amountUsd: number) {
      const candidate = QUESTS.find(
        (quest) =>
          quest.state === "active" && amountUsd >= quest.minDepositUsd
      );
      if (!candidate) {
        return;
      }

      updateQuest(candidate.id, (quest) => ({
        ...quest,
        state: "claimable",
        claimableAt: new Date().toISOString(),
      }));

      const currentIndex = QUEST_ORDER.indexOf(candidate.id);
      if (currentIndex >= 0 && currentIndex + 1 < QUEST_ORDER.length) {
        const nextId = QUEST_ORDER[currentIndex + 1];
        updateQuest(nextId, (quest) =>
          quest.state === "locked"
            ? { ...quest, state: "available" }
            : quest
        );
      }
    },
    claim(id: DepositQuest["id"]) {
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
  };
}
