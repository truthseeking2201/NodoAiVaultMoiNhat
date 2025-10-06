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
};
