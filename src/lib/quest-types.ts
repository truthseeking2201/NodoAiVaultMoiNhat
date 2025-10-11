export type QuestState =
  | "locked"
  | "available"
  | "active"
  | "claimable"
  | "completed"
  | "failed";

export type QuestKind = "deposit_and_hold" | "hold_existing";

export type LockReason =
  | "tier_not_unlocked"
  | "wallet_not_connected"
  | "insufficient_threshold"
  | "kyc_required"
  | "other";

export interface QuestRuntimeMeta {
  currentBalanceUsd?: number;
  requiredDepositUsd?: number;
  thresholdUsd?: number;
  depositMet?: boolean;
  holdRequiredMs?: number;
  holdAccumulatedMs?: number;
  holdRemainingMs?: number;
}

export interface BaseQuest {
  id: string;
  kind: QuestKind;
  title: string;
  description: string;
  rewardXp: number;
  vaultIdRequired?: string | "any";
  state: QuestState;
  lockedReason?: LockReason;
  startedAt?: string;
  endAt?: string;
  claimableAt?: string;
  completedAt?: string;
  runtime?: QuestRuntimeMeta;
}

export interface DepositAndHoldQuest extends BaseQuest {
  kind: "deposit_and_hold";
  minDepositUsd: number;
  holdHours: number;
  resetOnDrop?: boolean;
}

export interface HoldExistingQuest extends BaseQuest {
  kind: "hold_existing";
  holdThresholdUsd: number;
  holdHours: number;
  resetOnDrop?: boolean;
}

export type Quest = DepositAndHoldQuest | HoldExistingQuest;

export type VaultTx = {
  type: "deposit" | "withdraw";
  vaultId: string;
  amountUsd: number;
  ts: string;
};
