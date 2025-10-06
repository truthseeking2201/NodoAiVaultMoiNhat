import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getStore, setStore, subscribe } from "../mock/store";
import {
  computeStats,
  getMilestoneProgress,
  markRewards,
  recompute,
  sortEventsDescending,
  utcDayKey,
  upsertEvent,
} from "../logic";
import {
  QualifyingEvent,
  StreakEvent,
  StreakRecord,
  StreakReward,
  StreakStats,
} from "../types";
import { seedStreakDemo } from "../mock/seed-streak";

const buildKey = (wallet: string, vaultId: string) => `${wallet}::${vaultId}`;

const createBaseRecord = ({
  vaultId,
  wallet,
}: {
  vaultId: string;
  wallet: string;
}): StreakRecord => ({
  vaultId,
  wallet,
  current: 0,
  longest: 0,
  lastCountedDay: "",
  lastEventAt: 0,
});

const collectDayKeys = (events: StreakEvent[]) =>
  Array.from(new Set(events.map((event) => event.dayKey))).sort();

export type LogEventPayload = {
  vaultId: string;
  wallet: string;
  at: number;
  type: QualifyingEvent;
  amountUsd?: number;
};

export function useStreak(vaultId: string, wallet?: string) {
  const store = useSyncExternalStore(subscribe, getStore, getStore);

  const key = useMemo(() => (wallet ? buildKey(wallet, vaultId) : undefined), [
    wallet,
    vaultId,
  ]);

  const record = useMemo(() => {
    if (!key) return null;
    return store.records[key] ?? null;
  }, [key, store.records]);

  const events = useMemo(() => {
    if (!wallet) return [] as StreakEvent[];
    return store.events.filter(
      (event) => event.wallet === wallet && event.vaultId === vaultId
    );
  }, [store.events, wallet, vaultId]);

  const sortedEvents = useMemo(() => sortEventsDescending(events), [events]);

  const rewards = useMemo<StreakReward[]>(() => {
    if (!key) return [];
    const list = store.rewards?.[key];
    return Array.isArray(list) ? list : [];
  }, [key, store.rewards]);

  const ascendingEvents = useMemo(
    () => [...events].sort((a, b) => a.at - b.at),
    [events]
  );

  const computedRecord = useMemo(() => {
    if (!wallet) return null;
    const baseRecord = record ?? createBaseRecord({ vaultId, wallet });
    if (!ascendingEvents.length) return record ?? baseRecord;
    const dayKeys = collectDayKeys(ascendingEvents);
    const recomputed = recompute(baseRecord, dayKeys);
    const lastEventAt = ascendingEvents.reduce(
      (max, event) => (event.at > max ? event.at : max),
      0
    );
    return { ...recomputed, lastEventAt };
  }, [record, ascendingEvents, vaultId, wallet]);

  const stats: StreakStats = useMemo(
    () => computeStats(ascendingEvents, rewards),
    [ascendingEvents, rewards]
  );

  const resolvedRecord = computedRecord;
  const currentCount = resolvedRecord?.current ?? 0;
  const progress = useMemo(
    () => getMilestoneProgress(currentCount),
    [currentCount]
  );

  const logEvent = useCallback(
    ({ vaultId: vId, wallet: w, at, type, amountUsd }: LogEventPayload) => {
      if (!wallet || !key || !w || !vId) return;
      const event: StreakEvent = {
        vaultId: vId,
        wallet: w,
        type,
        at,
        dayKey: utcDayKey(at),
        amountUsd,
      };

      const latestStore = getStore();
      const nextEvents = upsertEvent(latestStore.events, event);
      if (nextEvents === latestStore.events) {
        return;
      }

      const scopedEvents = nextEvents.filter(
        (item) => item.vaultId === vId && item.wallet === w
      );
      const dayKeys = collectDayKeys(scopedEvents);
      const baseRecord = latestStore.records[key] ?? createBaseRecord({
        vaultId: vId,
        wallet: w,
      });
      const recomputed = recompute(baseRecord, dayKeys);
      const lastEventAt = scopedEvents.reduce((max, item) => {
        return item.at > max ? item.at : max;
      }, 0);
      const nextRecord = {
        ...recomputed,
        lastEventAt,
      };

      setStore({
        events: nextEvents,
        records: {
          ...latestStore.records,
          [key]: nextRecord,
        },
        rewards: latestStore.rewards,
      });
    },
    [wallet, key]
  );

  const ensureSnapshotForToday = useCallback(
    (hasNDLP: boolean) => {
      if (!wallet || !key || !hasNDLP) return;
      const now = Date.now();
      const today = utcDayKey(now);
      const latestStore = getStore();

      const alreadyLogged = latestStore.events.some(
        (event) =>
          event.vaultId === vaultId &&
          event.wallet === wallet &&
          event.dayKey === today
      );

      if (!alreadyLogged) {
        logEvent({ vaultId, wallet, at: now, type: "snapshot" });
      }
    },
    [vaultId, wallet, key, logEvent]
  );

  return {
    record: resolvedRecord,
    events: sortedEvents,
    rewards: markRewards(rewards, currentCount),
    stats,
    progress,
    logEvent,
    ensureSnapshotForToday,
    seedDemo: () => {
      if (wallet) {
        seedStreakDemo(vaultId, wallet);
      }
    },
  } as const;
}
