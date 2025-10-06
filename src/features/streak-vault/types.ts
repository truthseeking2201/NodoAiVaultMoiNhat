export type StreakRecord = {
  vaultId: string;
  wallet: string;
  current: number;
  longest: number;
  lastCountedDay: string;
  lastEventAt: number;
};

export type QualifyingEvent = "deposit" | "snapshot";

export type StreakEvent = {
  vaultId: string;
  wallet: string;
  type: QualifyingEvent;
  at: number;
  dayKey: string;
  amountUsd?: number;
};

export type StreakReward = {
  threshold: number;
  label: string;
  description?: string;
  claimed?: boolean;
};

export type StreakStats = {
  current: number;
  longest: number;
  runStart: string;
  lastEventAt: number;
  activeDays7: number;
  activeDays30: number;
  consistency7: number;
  missedDays30: number;
  deposits7: number;
  depositSum7: number;
  nextMilestone: number;
  daysToNext: number;
  etaNextDate: number;
};
