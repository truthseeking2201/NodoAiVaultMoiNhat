export type QuestId =
  | "welcome_deposit_5"
  | "deposit_50"
  | "streak_3d"
  | "hold_7"
  | "hold_30"
  | "highroller_500";

export type QuestState =
  | "locked"
  | "available"
  | "active"
  | "claimable"
  | "completed"
  | "failed";

export type QuestKind =
  | "deposit_once"
  | "streak"
  | "hold_days"
  | "highroller";

export interface QuestDefinition {
  id: QuestId;
  kind: QuestKind;
  title: string;
  description?: string;
  minDepositUsd?: number;
  holdDays?: number;
  streakDays?: number;
  rewardXp: number;
}

export interface QuestRecord {
  id: QuestId;
  state: QuestState;
  startedAt?: string;
  claimableAt?: string;
  failedAt?: string;
  completedAt?: string;
  progressPct?: number;
  holdThresholdUsd?: number;
  cooldownUntil?: string;
}

export type QuestRuntime = QuestDefinition & QuestRecord;
