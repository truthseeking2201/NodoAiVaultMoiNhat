import { getStore, setStore } from "./store";
import { utcDayKey } from "../logic";
import { StreakEvent, StreakReward } from "../types";

const DAY_MS = 86_400_000;

const defaultRewards: StreakReward[] = [
  {
    threshold: 3,
    label: "Vault flair",
    description: "Profile flair unlocked for this vault",
  },
  {
    threshold: 7,
    label: "XP badge",
    description: "+1 badge on your profile",
  },
  {
    threshold: 14,
    label: "XP boost 5%",
    description: "Boost applies for the next 24h",
  },
  {
    threshold: 30,
    label: "APR booster 0.5%",
    description: "Limited-time APR booster",
  },
];

export function seedStreakDemo(vaultId: string, wallet: string) {
  if (!vaultId || !wallet) return;
  const store = getStore();
  const key = `${wallet}::${vaultId}`;

  // avoid reseeding if events already present
  const hasEvents = store.events.some(
    (event) => event.vaultId === vaultId && event.wallet === wallet
  );
  if (hasEvents) {
    if (!store.rewards?.[key]) {
      setStore({
        ...store,
        rewards: {
          ...store.rewards,
          [key]: defaultRewards,
        },
      });
    }
    return;
  }

  const base = Date.UTC(2024, 8, 7); // 2024-09-07

  const events: StreakEvent[] = [];
  for (let i = 0; i < 35; i += 1) {
    const day = base + i * DAY_MS;
    const dayKey = utcDayKey(day);

    // skip one day to demonstrate reset
    if (i === 12) continue;

    // snapshot is main qualifying event
    events.push({
      vaultId,
      wallet,
      type: "snapshot",
      at: day + 12 * 3_600_000,
      dayKey,
    });

    // periodic deposits every 3 days for variety
    if (i % 3 === 0) {
      const amount = 100 + ((i / 3) % 5) * 50;
      events.push({
        vaultId,
        wallet,
        type: "deposit",
        at: day + 15 * 3_600_000,
        dayKey,
        amountUsd: amount,
      });
    }
  }

  setStore({
    events: [...store.events, ...events],
    records: store.records,
    rewards: {
      ...(store.rewards ?? {}),
      [key]: defaultRewards,
    },
  });
}
