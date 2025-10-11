export type DepositIntent = {
  amountUsd: number;
  questId: string;
  source: "quest";
  vaultId?: string;
};

const STORAGE_KEY = "deposit-intent";

export function setDepositIntent(intent: DepositIntent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export function consumeDepositIntent(): DepositIntent | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  localStorage.removeItem(STORAGE_KEY);
  try {
    return JSON.parse(raw) as DepositIntent;
  } catch (error) {
    console.error("Failed to parse deposit intent", error);
    return null;
  }
}

export function requeueDepositIntent(intent: DepositIntent) {
  setDepositIntent(intent);
}
