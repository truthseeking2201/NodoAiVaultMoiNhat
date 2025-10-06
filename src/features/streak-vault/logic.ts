import {
  StreakEvent,
  StreakRecord,
  StreakReward,
  StreakStats,
} from "./types";

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

type DaySummary = {
  dayKey: string;
  timestamp: number;
  deposits: number;
  depositSum: number;
};

const toDaySummaries = (events: StreakEvent[]): DaySummary[] => {
  const map = new Map<string, DaySummary>();
  events.forEach((event) => {
    const entry = map.get(event.dayKey) ?? {
      dayKey: event.dayKey,
      timestamp: Date.parse(event.dayKey),
      deposits: 0,
      depositSum: 0,
    };
    if (event.type === "deposit") {
      entry.deposits += 1;
      entry.depositSum += event.amountUsd ?? 0;
    }
    map.set(event.dayKey, entry);
  });
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
};

export function computeStats(
  events: StreakEvent[],
  rewards: StreakReward[],
  todayMs = Date.now()
): StreakStats {
  if (!events.length) {
    const nextMilestone = rewards[0]?.threshold ?? MILESTONES[1] ?? 1;
    return {
      current: 0,
      longest: 0,
      runStart: "",
      lastEventAt: 0,
      activeDays7: 0,
      activeDays30: 0,
      consistency7: 0,
      missedDays30: 30,
      deposits7: 0,
      depositSum7: 0,
      nextMilestone,
      daysToNext: nextMilestone,
      etaNextDate: todayMs + nextMilestone * DAY_MS,
    };
  }

  const summaries = toDaySummaries(events);
  const dayKeys = summaries.map((summary) => summary.dayKey);
  const recordBase: StreakRecord = {
    vaultId: events[0].vaultId,
    wallet: events[0].wallet,
    current: 0,
    longest: 0,
    lastCountedDay: "",
    lastEventAt: 0,
  };
  const recomputed = recompute(recordBase, dayKeys);

  // Determine start day of current run
  let runStart = recomputed.lastCountedDay;
  if (recomputed.current > 0) {
    let remaining = recomputed.current - 1;
    const sorted = [...dayKeys].sort();
    for (let i = sorted.length - 1; i >= 0 && remaining > 0; i -= 1) {
      const currentDay = sorted[i];
      const previousDay = sorted[i - 1];
      if (!previousDay) break;
      const diff = Date.parse(currentDay) - Date.parse(previousDay);
      if (diff === DAY_MS) {
        runStart = previousDay;
        remaining -= 1;
      } else {
        break;
      }
    }
  }

  const lastEventAt = Math.max(...events.map((event) => event.at));
  const sevenDaysAgo = todayMs - 6 * DAY_MS;
  const thirtyDaysAgo = todayMs - 29 * DAY_MS;

  const activeDays7 = summaries.filter((summary) => summary.timestamp >= sevenDaysAgo).length;
  const activeDays30 = summaries.filter((summary) => summary.timestamp >= thirtyDaysAgo).length;
  const deposits7 = events.filter(
    (event) => event.type === "deposit" && event.at >= sevenDaysAgo
  ).length;
  const depositSum7 = events
    .filter((event) => event.type === "deposit" && event.at >= sevenDaysAgo)
    .reduce((sum, event) => sum + (event.amountUsd ?? 0), 0);

  const nextMilestone = rewards.find((reward) => reward.threshold > recomputed.current)?.threshold
    ?? getNextMilestone(recomputed.current);
  const daysToNext = Math.max(0, nextMilestone - recomputed.current);
  const etaNextDate = todayMs + daysToNext * DAY_MS;

  return {
    current: recomputed.current,
    longest: recomputed.longest,
    runStart,
    lastEventAt,
    activeDays7,
    activeDays30,
    consistency7: Math.min(1, activeDays7 / 7),
    missedDays30: Math.max(0, 30 - activeDays30),
    deposits7,
    depositSum7,
    nextMilestone,
    daysToNext,
    etaNextDate,
  };
}

export function markRewards(rewards: StreakReward[], current: number): StreakReward[] {
  return rewards.map((reward) => ({
    ...reward,
    claimed: current >= reward.threshold,
  }));
}
