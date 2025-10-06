import { StreakEvent, StreakRecord } from "../types";

type Store = {
  events: StreakEvent[];
  records: Record<string, StreakRecord>;
};

const STORAGE_KEY = "STREAK_V1";

const defaultStore: Store = {
  events: [],
  records: {},
};

const getLocalStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

const storage = getLocalStorage();

let mem: Store = defaultStore;

if (storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        mem = {
          events: Array.isArray(parsed.events) ? parsed.events : [],
          records: typeof parsed.records === "object" && parsed.records !== null
            ? parsed.records
            : {},
        };
      }
    }
  } catch (error) {
    mem = defaultStore;
  }
}

const listeners = new Set<() => void>();

export const getStore = () => mem;

export const setStore = (store: Store) => {
  mem = store;
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(mem));
    } catch (error) {
      // noop - best effort persistence only in mock mode
    }
  }
  listeners.forEach((listener) => listener());
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const resetStore = () => {
  setStore(defaultStore);
};
