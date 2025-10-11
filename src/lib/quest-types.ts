export type QuestState =
  | "locked"
  | "available"
  | "active"
  | "claimable"
  | "completed"
  | "failed";

export type LockReason =
  | "tier_not_unlocked"
  | "wallet_not_connected"
  | "insufficient_threshold"
  | "kyc_required"
  | "other";

export type QuestKind = "deposit_once" | "hold_days" | "highroller";

export interface BaseQuest {
  id: string;
  kind: QuestKind;
  title: string;
  description: string;
  rewardXp: number;
  state: QuestState;
  lockedReason?: LockReason;
  startedAt?: string;
  endAt?: string;
  claimableAt?: string;
  completedAt?: string;
  failedAt?: string;
}

export interface DepositQuest extends BaseQuest {
  kind: "deposit_once" | "highroller";
  minDepositUsd: number;
  holdDays?: number;
}

export interface HoldQuest extends BaseQuest {
  kind: "hold_days";
  holdDays: number;
  holdThresholdUsd: number;
  progressPct?: number;
}

export type Quest = DepositQuest | HoldQuest;
