import { describe, expect, it, vi } from "vitest";
import {
  computeStats,
  markRewards,
  recompute,
  upsertEvent,
  utcDayKey,
} from "./logic";
import { StreakEvent, StreakRecord, StreakReward } from "./types";

const baseRecord: StreakRecord = {
  vaultId: "vault-1",
  wallet: "wallet-1",
  current: 0,
  longest: 0,
  lastCountedDay: "",
  lastEventAt: 0,
};

describe("utcDayKey", () => {
  it("returns ISO day for UTC timestamp", () => {
    const timestamp = Date.UTC(2024, 7, 25, 23, 59, 59); // Aug 25 2024 at 23:59:59 UTC
    expect(utcDayKey(timestamp)).toBe("2024-08-25");
  });
});

describe("upsertEvent", () => {
  const sampleEvent: StreakEvent = {
    vaultId: "vault-1",
    wallet: "wallet-1",
    type: "deposit",
    at: Date.UTC(2024, 7, 25),
    dayKey: "2024-08-25",
  };

  it("adds new events when day and type are unique", () => {
    const events: StreakEvent[] = [];
    const result = upsertEvent(events, sampleEvent);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(sampleEvent);
  });

  it("keeps only one event per day and type", () => {
    const events: StreakEvent[] = [sampleEvent];
    const duplicate = { ...sampleEvent, at: sampleEvent.at + 1_000 };
    const result = upsertEvent(events, duplicate);
    expect(result).toHaveLength(1);
    expect(result[0].at).toBe(sampleEvent.at);
  });

  it("allows multiple event types for the same day", () => {
    const depositEvent = sampleEvent;
    const snapshotEvent: StreakEvent = {
      ...sampleEvent,
      type: "snapshot",
    };
    const result = upsertEvent([depositEvent], snapshotEvent);
    expect(result).toHaveLength(2);
    expect(result[1].type).toBe("snapshot");
  });
});

describe("recompute", () => {
  it("calculates current streak and longest streak for consecutive days", () => {
    vi.useFakeTimers();
    const now = new Date("2024-08-30T00:00:00Z");
    vi.setSystemTime(now);

    const dayKeys = ["2024-08-28", "2024-08-29", "2024-08-30"];
    const result = recompute(baseRecord, dayKeys);

    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
    expect(result.lastCountedDay).toBe("2024-08-30");
    expect(result.lastEventAt).toBe(now.getTime());

    vi.useRealTimers();
  });

  it("resets current streak when there is a gap", () => {
    vi.useFakeTimers();
    const now = new Date("2024-09-10T00:00:00Z");
    vi.setSystemTime(now);

    const dayKeys = ["2024-09-05", "2024-09-07", "2024-09-08"];
    const result = recompute({ ...baseRecord, longest: 5 }, dayKeys);

    expect(result.current).toBe(2);
    expect(result.longest).toBe(5);
    expect(result.lastCountedDay).toBe("2024-09-08");
    expect(result.lastEventAt).toBe(now.getTime());

    vi.useRealTimers();
  });

  it("returns zeroed state when there are no day keys", () => {
    const result = recompute({ ...baseRecord, longest: 4 }, []);

    expect(result.current).toBe(0);
    expect(result.longest).toBe(4);
    expect(result.lastCountedDay).toBe("");
    expect(result.lastEventAt).toBe(0);
  });
});

describe("computeStats", () => {
  const sampleRewards: StreakReward[] = [
    { threshold: 3, label: "Flair" },
    { threshold: 7, label: "Badge" },
    { threshold: 14, label: "Boost" },
  ];

  const baseEvents: StreakEvent[] = [
    { vaultId: "vault-1", wallet: "wallet-1", type: "snapshot", at: Date.UTC(2024, 8, 1, 12), dayKey: "2024-09-01" },
    { vaultId: "vault-1", wallet: "wallet-1", type: "deposit", at: Date.UTC(2024, 8, 1, 15), dayKey: "2024-09-01", amountUsd: 150 },
    { vaultId: "vault-1", wallet: "wallet-1", type: "snapshot", at: Date.UTC(2024, 8, 2, 12), dayKey: "2024-09-02" },
    { vaultId: "vault-1", wallet: "wallet-1", type: "deposit", at: Date.UTC(2024, 8, 4, 12), dayKey: "2024-09-04", amountUsd: 120 },
    { vaultId: "vault-1", wallet: "wallet-1", type: "snapshot", at: Date.UTC(2024, 8, 5, 12), dayKey: "2024-09-05" },
  ];

  it("summarises streak stats correctly", () => {
    const today = Date.UTC(2024, 8, 6);
    const stats = computeStats(baseEvents, sampleRewards, today);

    expect(stats.current).toBeGreaterThan(0);
    expect(stats.longest).toBeGreaterThan(0);
    expect(stats.activeDays7).toBe(4);
    expect(stats.deposits7).toBe(2);
    expect(stats.depositSum7).toBe(270);
    expect(stats.nextMilestone).toBeGreaterThanOrEqual(stats.current);
  });

  it("marks rewards as claimed", () => {
    const marked = markRewards(sampleRewards, 7);
    expect(marked[0].claimed).toBe(true);
    expect(marked[1].claimed).toBe(true);
    expect(marked[2].claimed).toBe(false);
  });
});
