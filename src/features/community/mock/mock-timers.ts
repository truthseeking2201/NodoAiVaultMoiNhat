import { QueryClient } from "@tanstack/react-query";
import { getMockDB, setMockDB } from "./mock-db";

let intervalId: number | undefined;

const mutateHoldings = () => {
  const db = getMockDB();
  const nextHoldings = { ...db.holdings };
  let changed = false;
  const now = Date.now();
  Object.entries(nextHoldings).forEach(([key, holding]) => {
    const drift = (Math.random() - 0.5) * 20;
    const nextValue = Math.max(0, holding.currentValueUSD + drift);
    if (Math.abs(nextValue - holding.currentValueUSD) > 0.01) {
      const ndlpDrift = (Math.random() - 0.5) * 5;
      nextHoldings[key] = {
        ...holding,
        currentValueUSD: nextValue,
        ndlp: Math.max(0, holding.ndlp + ndlpDrift),
        updatedAt: now,
      };
      changed = true;
    }
  });
  if (changed) {
    setMockDB({
      ...db,
      holdings: nextHoldings,
    });
  }
};

export const startCommunityMockTimers = (queryClient: QueryClient) => {
  if (typeof window === "undefined") return;
  if (intervalId) return;
  intervalId = window.setInterval(() => {
    mutateHoldings();
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return (
          Array.isArray(key) && key[0] === "community" && key[1] === "scoreboard"
        );
      },
    });
  }, 60 * 60 * 1000);
};

export const stopCommunityMockTimers = () => {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = undefined;
  }
};
