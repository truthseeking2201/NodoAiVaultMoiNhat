export type QuestState =
  | "locked"
  | "available"
  | "active"
  | "claimable"
  | "completed"
  | "failed";

export type QuestId =
  | "welcome_deposit_5"
  | "deposit_50"
  | "highroller_500";

export interface DepositQuest {
  id: QuestId;
  title: string;
  minDepositUsd: number;
  rewardXp: number;
  state: QuestState;
  startedAt?: string;
  claimableAt?: string;
  completedAt?: string;
  failedAt?: string;
  targetVaultId?: string;
}
