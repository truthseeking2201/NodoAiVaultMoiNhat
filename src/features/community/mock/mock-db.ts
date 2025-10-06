import { Pool, PoolMember, HoldingSnapshot } from "../types";

type MockState = {
  pools: Pool[];
  members: PoolMember[];
  holdings: Record<string, HoldingSnapshot>;
};

const STORAGE_KEY = "COMMUNITY_MOCK_V1";

let state: MockState = {
  pools: [],
  members: [],
  holdings: {},
};

const subscribers = new Set<(next: MockState) => void>();

const safeParse = (raw: string | null): MockState | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MockState;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      pools: parsed.pools ?? [],
      members: parsed.members ?? [],
      holdings: parsed.holdings ?? {},
    };
  } catch (err) {
    console.warn("community mock: failed to parse storage", err);
    return null;
  }
};

const persist = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("community mock: failed to persist", err);
  }
};

export const hydrateMockDB = () => {
  if (typeof window === "undefined") return;
  const next = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (next) {
    state = next;
  }
};

if (typeof window !== "undefined") {
  hydrateMockDB();
}

export const getMockDB = (): MockState => state;

export const setMockDB = (next: MockState) => {
  state = {
    pools: [...next.pools],
    members: [...next.members],
    holdings: { ...next.holdings },
  };
  persist();
  subscribers.forEach((listener) => listener(state));
};

export const updateMockDB = (updater: (current: MockState) => MockState | void) => {
  const current = getMockDB();
  const result = updater(current);
  if (result) {
    setMockDB(result);
  } else {
    setMockDB(current);
  }
};

export const subscribeMockDB = (listener: (next: MockState) => void) => {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
};

export const resetMockDB = () => {
  state = { pools: [], members: [], holdings: {} };
  persist();
  subscribers.forEach((listener) => listener(state));
};

export type { MockState };
