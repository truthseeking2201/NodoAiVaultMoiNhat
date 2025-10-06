import { StreakEvent, StreakRecord } from "./types";

const DAY_MS = 86_400_000;

export const utcDayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function upsertEvent(events: StreakEvent[], e: StreakEvent) {
  const exists = events.some(
    (x) =>
      x.vaultId === e.vaultId &&
      x.wallet === e.wallet &&
      x.dayKey === e.dayKey &&
      x.type === e.type
  );
  if (exists) {
    return events;
  }
  return [...events, e];
}

export function recompute(base: StreakRecord, dayKeys: string[]): StreakRecord {
  if (!dayKeys.length) {
    return {
      ...base,
      current: 0,
      longest: base.longest,
      lastCountedDay: "",
      lastEventAt: 0,
    };
  }

  let current = 0;
  let longest = base.longest;
  let previous = "";

  const sortedKeys = [...dayKeys].sort();

  for (const day of sortedKeys) {
    const isNext = previous
      ? Date.parse(day) - Date.parse(previous) === DAY_MS
      : true;

    current = isNext ? current + 1 : 1;
    if (current > longest) {
      longest = current;
    }
    previous = day;
  }

  return {
    ...base,
    current,
    longest,
    lastCountedDay: previous,
    lastEventAt: Date.now(),
  };
}

export const MILESTONES = [1, 3, 7, 14, 30, 60, 90];

export function getNextMilestone(current: number) {
  for (const milestone of MILESTONES) {
    if (current < milestone) {
      return milestone;
    }
  }
  return current;
}

export function getMilestoneProgress(current: number) {
  const next = getNextMilestone(current);
  const prev = [...MILESTONES].reverse().find((milestone) => milestone <= current) ?? 0;
  const range = next - prev || 1;
  const progress = current - prev;
  return {
    current,
    previous: prev,
    next,
    percent: Math.min(100, Math.max(0, (progress / range) * 100)),
  };
}

export function sortEventsDescending(events: StreakEvent[]) {
  return [...events].sort((a, b) => b.at - a.at);
}
